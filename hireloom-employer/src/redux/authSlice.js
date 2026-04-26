import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerEmployerAPI,
  loginEmployerAPI,
  getEmployerProfileAPI,
  updateEmployerProfileAPI,
  logoutEmployerAPI,
} from "../services/authService";

// ==============================
// REGISTER
// ==============================
export const registerEmployer = createAsyncThunk(
  "auth/registerEmployer",
  async (data, { rejectWithValue }) => {
    try {
      const res = await registerEmployerAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// LOGIN
// ==============================
export const loginEmployer = createAsyncThunk(
  "auth/loginEmployer",
  async (data, { rejectWithValue }) => {
    try {
      const res = await loginEmployerAPI(data);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// PROFILE
// ==============================
export const getEmployerProfile = createAsyncThunk(
  "auth/getEmployerProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getEmployerProfileAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// UPDATE PROFILE
// ==============================
export const updateEmployerProfile = createAsyncThunk(
  "auth/updateEmployerProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await updateEmployerProfileAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// LOGOUT
// ==============================
export const logoutEmployer = createAsyncThunk(
  "auth/logoutEmployer",
  async (_, { rejectWithValue }) => {
    try {
      await logoutEmployerAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ==============================
// SLICE
// ==============================
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearAuthState: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginEmployer.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginEmployer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginEmployer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(registerEmployer.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      // PROFILE
      .addCase(getEmployerProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      // LOGOUT
      .addCase(logoutEmployer.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;