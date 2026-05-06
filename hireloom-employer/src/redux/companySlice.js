// src/redux/companySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCompanyAPI,
  getMyCompanyAPI,
  searchCompanyAPI,
  joinCompanyAPI,
  updateCompanyAPI,
} from "../services/companyService";

// ==============================
// 🏢 CREATE COMPANY
// ==============================
export const createCompany = createAsyncThunk(
  "company/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createCompanyAPI(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Create failed");
    }
  }
);

// ==============================
// 📥 GET MY COMPANY
// ==============================
export const getMyCompany = createAsyncThunk(
  "company/getMy",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyCompanyAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

// ==============================
// 🔍 SEARCH COMPANY
// ==============================
export const searchCompany = createAsyncThunk(
  "company/search",
  async (query, { rejectWithValue }) => {
    try {
      return await searchCompanyAPI(query);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

// ==============================
// 🔗 JOIN COMPANY
// ==============================
export const joinCompany = createAsyncThunk(
  "company/join",
  async (companyId, { rejectWithValue }) => {
    try {
      return await joinCompanyAPI(companyId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Join failed");
    }
  }
);

// ==============================
// ✏️ UPDATE COMPANY
// ==============================
export const updateCompany = createAsyncThunk(
  "company/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateCompanyAPI(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// ==============================
// 🎯 SLICE
// ==============================
const companySlice = createSlice({
  name: "company",
  initialState: {
    myCompany: null,
    searchResults: [],
    loading: false,
    error: null,
    success: false,
  },

  reducers: {
    clearCompanyState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE COMPANY
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.myCompany = action.payload.data;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET MY COMPANY
      .addCase(getMyCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.myCompany = action.payload.data;
      })
      .addCase(getMyCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // SEARCH COMPANY
      .addCase(searchCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // JOIN COMPANY
      .addCase(joinCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.myCompany = action.payload.data;
      })
      .addCase(joinCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE COMPANY
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.myCompany = action.payload.data;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCompanyState, clearSearchResults } = companySlice.actions;

export default companySlice.reducer;