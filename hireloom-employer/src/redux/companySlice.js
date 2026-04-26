import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCompanyAPI,
  getMyCompanyAPI,
  joinCompanyAPI,
} from "../services/companyService";

// ==============================
// CREATE COMPANY
// ==============================
export const createCompany = createAsyncThunk(
  "company/createCompany",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createCompanyAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// GET MY COMPANY
// ==============================
export const getMyCompany = createAsyncThunk(
  "company/getMyCompany",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyCompanyAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// JOIN COMPANY
// ==============================
export const joinCompany = createAsyncThunk(
  "company/joinCompany",
  async (id, { rejectWithValue }) => {
    try {
      const res = await joinCompanyAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// SLICE
// ==============================
const companySlice = createSlice({
  name: "company",
  initialState: {
    company: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCompany.fulfilled, (state, action) => {
        state.company = action.payload;
      })
      .addCase(getMyCompany.fulfilled, (state, action) => {
        state.company = action.payload;
      })
      .addCase(joinCompany.fulfilled, (state, action) => {
        state.company = action.payload;
      });
  },
});

export default companySlice.reducer;