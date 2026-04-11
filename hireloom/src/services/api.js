import axios from "axios";

// 🔗 Create instance
const API = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

// ==============================
// 🔥 REQUEST INTERCEPTOR
// ==============================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==============================
// 🔥 RESPONSE INTERCEPTOR
// ==============================
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - Redirect to login");

      // Optional: redirect
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;