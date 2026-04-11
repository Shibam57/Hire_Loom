import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerEmployeeAPI,
  loginEmployeeAPI,
  getCurrentEmployeeAPI,
  logoutEmployeeAPI,
} from "../services/authService";

// ==============================
// 🔥 ASYNC THUNKS
// ==============================

// 👤 Register
export const registerEmployee = createAsyncThunk(
  "auth/registerEmployee",
  async (formData, thunkAPI) => {
    try {
      const responce = await registerEmployeeAPI(formData);
      return responce;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Register failed");
    }
  }
);

// 🔐 Login
export const loginEmployee = createAsyncThunk(
  "auth/loginEmployee",
  async (formData, thunkAPI) => {
    try {
      const responce = await loginEmployeeAPI(formData);
      return responce;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// 🔍 Get Current User
export const getCurrentEmployee = createAsyncThunk(
  "auth/getCurrentEmployee",
  async (_, thunkAPI) => {
    try {
      const data = await getCurrentEmployeeAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Not authenticated");
    }
  }
);

// 🚪 Logout
export const logoutEmployee = createAsyncThunk(
  "auth/logoutEmployee",
  async (_, thunkAPI) => {
    try {
      await logoutEmployeeAPI();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// ==============================
// 🧠 SLICE
// ==============================

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },

  reducers: {
    // ✅ Clear error manually
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================
      // REGISTER
      // =====================
      .addCase(registerEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(registerEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================
      // LOGIN
      // =====================
      .addCase(loginEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(loginEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================
      // GET CURRENT USER
      // =====================
      .addCase(getCurrentEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentEmployee.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // =====================
      // LOGOUT
      // =====================
      .addCase(logoutEmployee.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;