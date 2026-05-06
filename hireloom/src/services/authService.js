import axios from "axios";

// 🔗 Create Axios Instance
import API from "./api";

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

  console.log("LOGIN RESPONSE:", response.data);

  // 👉 Save token (if backend sends it)
  localStorage.setItem("token", response.data.data.accessToken);
  localStorage.setItem("user", JSON.stringify(response.data.data.user));

  return response.data;
};

// ==============================
// 🔍 GET CURRENT EMPLOYEE
// ==============================
export const getCurrentEmployeeAPI = async () => {
  const response = await API.get("/employees/profile");
  return response.data;
};

export const addEmployeeSkillsAPI = async (skills) => {
  const res = await API.post("/employees/skills/add", { skills });
  return res.data;
};

// ==============================
// ✏️ UPDATE PROFILE
// ==============================
export const updateEmployeeProfileAPI = async (data) => {
  const res = await API.put("/employees/profile/update", data);
  return res.data;
};

// ==============================
// 🚪 LOGOUT EMPLOYEE
// ==============================
export const logoutEmployeeAPI = async () => {
  const response = await API.post("/employees/logout");
  return response.data;
};