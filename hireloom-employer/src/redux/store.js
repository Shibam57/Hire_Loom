import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobReducer from "./jobSlice";
import companyReducer from "./companySlice";
import applicationReducer from "./applicationSlice";
import dashboardReducer from "./dashboardSlice"; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    company: companyReducer,
    application: applicationReducer,
    dashboard: dashboardReducer, 
  },
});

export default store;