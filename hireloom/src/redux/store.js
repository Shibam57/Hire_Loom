import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobsReducer from "./jobSlice";
import applicationReducer from "./applicationSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationReducer,
  },
});

export default store;