import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployerApplicationsAPI,
  updateApplicationStatusAPI,
  getJobApplicationsAPI,
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

// GET APPLICANTS
export const getJobApplications = createAsyncThunk(
  "applications/getJobApplications",
  async (jobId, thunkAPI) => {
    try {
      const res = await getJobApplicationsAPI(jobId);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch applicants"
      );
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
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ======================
      // GET JOB APPLICATIONS
      // ======================
      .addCase(getJobApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(getJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================
      // UPDATE STATUS
      // ======================
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const updated = action.payload;

        state.applications = state.applications.map((app) =>
          app._id === updated._id ? updated : app
        );
      })

      // ======================
      // EMPLOYER DASHBOARD
      // ======================
      .addCase(getEmployerApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
      });
  },
});

export default applicationSlice.reducer;