import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardDataAPI } from "../services/dashboardService";
import { deleteJobAPI } from "../services/jobService"; // ✅ USE EXISTING

// ================= GET DASHBOARD =================
export const getDashboardData = createAsyncThunk(
  "dashboard/getData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDashboardDataAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ================= DELETE JOB =================
export const deleteJob = createAsyncThunk(
  "dashboard/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      await deleteJobAPI(id); // ✅ reuse
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    jobs: [],
    stats: {
      totalJobs: 0,
      totalApplicants: 0,
    },
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.stats = {
          totalJobs: action.payload.totalJobs,
          totalApplicants: action.payload.totalApplicants,
        };
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
        state.stats.totalJobs -= 1;
      });
  },
});

export default dashboardSlice.reducer;