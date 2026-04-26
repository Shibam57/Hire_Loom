import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployerApplicationsAPI,
  updateApplicationStatusAPI,
} from "../services/applicationService";

// ==============================
// GET APPLICATIONS
// ==============================
export const getEmployerApplications = createAsyncThunk(
  "applications/getEmployerApplications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getEmployerApplicationsAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// UPDATE STATUS
// ==============================
export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateApplicationStatusAPI(id, status);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// SLICE
// ==============================
const applicationSlice = createSlice({
  name: "applications",
  initialState: {
    applications: [],
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmployerApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.applications.findIndex(
          (app) => app._id === action.payload._id
        );
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      });
  },
});

export default applicationSlice.reducer;