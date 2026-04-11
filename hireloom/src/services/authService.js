import axios from "axios";

// 🔗 Create Axios Instance
import API from "./api";

// const API = axios.create({
//   baseURL: "http://localhost:4000/api",
//   withCredentials: true, // for cookies (JWT)
// });

// ==============================
// 👤 REGISTER EMPLOYEE
// ==============================
export const registerEmployeeAPI = async (data) => {
  const response = await API.post("/employees/register", data, {
    withCredentials: true
  });
  console.log("REGISTER RESPONSE:", response.data);
  return response.data;
};

// ==============================
// 🔐 LOGIN EMPLOYEE
// ==============================
export const loginEmployeeAPI = async (data) => {
  const response = await API.post("/employees/login", data);

  // 👉 Save token (if backend sends it)
  localStorage.setItem("token", response.data.token);

  return response.data;
};

// ==============================
// 🔍 GET CURRENT EMPLOYEE
// ==============================
export const getCurrentEmployeeAPI = async () => {
  const response = await API.get("/employees/me");
  return response.data;
};

// ==============================
// 🚪 LOGOUT EMPLOYEE
// ==============================
export const logoutEmployeeAPI = async () => {
  const response = await API.post("/employees/logout");
  return response.data;
};