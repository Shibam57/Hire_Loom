import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  applyJobAPI,
  getMyApplicationsAPI,
  getApplicationByIdAPI,
  withdrawApplicationAPI,
} from "../services/applicationService";

// ==============================
// 📤 APPLY JOB
// ==============================
export const applyJob = createAsyncThunk(
  "applications/applyJob",
  async ({ jobId, formData }, { rejectWithValue }) => {
    try {
      const res = await applyJobAPI(jobId, formData);
      return res.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// 📥 GET MY APPLICATIONS
// ==============================
export const getMyApplications = createAsyncThunk(
  "applications/getMyApplications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyApplicationsAPI();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// 📄 GET SINGLE APPLICATION
// ==============================
export const getApplicationById = createAsyncThunk(
  "applications/getApplicationById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getApplicationByIdAPI(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// ❌ WITHDRAW APPLICATION
// ==============================
export const withdrawApplication = createAsyncThunk(
  "applications/withdrawApplication",
  async (id, { rejectWithValue }) => {
    try {
      const res = await withdrawApplicationAPI(id);
      return { id, message: res.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// 🧠 INITIAL STATE
// ==============================
const initialState = {
  applications: [],
  application: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ==============================
// 🧩 SLICE
// ==============================
const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearApplicationState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ========================
      // APPLY JOB
      // ========================
      .addCase(applyJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyJob.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(applyJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========================
      // GET MY APPLICATIONS
      // ========================
      .addCase(getMyApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(getMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========================
      // GET SINGLE APPLICATION
      // ========================
      .addCase(getApplicationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========================
      // WITHDRAW APPLICATION
      // ========================
      .addCase(withdrawApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;

        // remove withdrawn application from list
        state.applications = state.applications.filter(
          (app) => app._id !== action.payload.id
        );
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearApplicationState } = applicationSlice.actions;
export default applicationSlice.reducer;