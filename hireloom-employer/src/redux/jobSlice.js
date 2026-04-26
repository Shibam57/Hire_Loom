import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createJobAPI,
  getEmployerJobsAPI,
  updateJobAPI,
  deleteJobAPI,
} from "../services/jobService";

// ==============================
// CREATE JOB
// ==============================
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createJobAPI(data);
      return res.data.data; // ✅ FIX
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// GET MY JOBS
// ==============================
export const getEmployerJobs = createAsyncThunk(
  "jobs/getEmployerJobs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getEmployerJobsAPI();
      return res.data.data; // ✅ FIX
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// DELETE JOB
// ==============================
export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      await deleteJobAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// SLICE
// ==============================
const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ================= GET JOBS =================
      .addCase(getEmployerJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployerJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(getEmployerJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= CREATE JOB =================
      .addCase(createJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload); // 🔥 better UX (new job top)
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= DELETE JOB =================
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(
          (job) => job._id !== action.payload
        );
      });
  },
});

export default jobSlice.reducer;