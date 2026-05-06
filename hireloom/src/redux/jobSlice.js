import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getJobsAPI,
  getJobByIdAPI,
  filterJobsAPI,
  applyJobAPI,
} from "../services/jobService";

// ==============================
// 🚀 GET ALL JOBS
// ==============================
export const getJobs = createAsyncThunk(
  "jobs/getJobs",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getJobsAPI(params);
      console.log("RAW RES:", res);
      console.log("JOBS PATH 1:", res.data?.jobs);
      console.log("JOBS PATH 2:", res.jobs);
      const jobs = res?.data?.jobs || [];
      return jobs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// 📄 GET JOB BY ID
// ==============================
export const getJobById = createAsyncThunk(
  "jobs/getJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getJobByIdAPI(jobId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// 🔍 FILTER JOBS
// ==============================
export const filterJobs = createAsyncThunk(
  "jobs/filterJobs",
  async (filters, { rejectWithValue }) => {
    try {
      const res = await filterJobsAPI(filters);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ==============================
// 📤 APPLY JOB
// ==============================
export const applyJob = createAsyncThunk(
  "jobs/applyJob",
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
// 🧠 INITIAL STATE
// ==============================
const initialState = {
  jobs: [],
  job: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ==============================
// 🧩 SLICE
// ==============================
const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ========================
      // GET JOBS
      // ========================
      .addCase(getJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        console.log("REDUX PAYLOAD:", action.payload);
        state.jobs = action.payload; // ✅ must be array
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========================
      // GET SINGLE JOB
      // ========================
      .addCase(getJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
      })
      .addCase(getJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========================
      // FILTER JOBS
      // ========================
      .addCase(filterJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(filterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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
      });
  },
});

export const { clearJobState } = jobSlice.actions;
export default jobSlice.reducer;