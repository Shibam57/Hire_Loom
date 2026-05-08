import API from "./api";

// ==============================
// 📝 REGISTER EMPLOYER
// ==============================
export const registerEmployerAPI = async (data) => {
  const res = await API.post("/employers/register", data);
  return res.data;
};

// ==============================
// 🔐 LOGIN EMPLOYER
// ==============================
export const loginEmployerAPI = async (data) => {
  const res = await API.post("/employers/login", data);
  console.log("LOGIN RESPONSE:", res.data.data.accessToken);

  // 👉 Save token (if backend sends it)
  localStorage.setItem("token", res.data.data.refreshToken);

  return res.data;
};

// ==============================
// 👤 GET PROFILE
// ==============================
export const getEmployerProfileAPI = async () => {
  const res = await API.get("/employers/profile");
  return res.data;
};

// ==============================
// ✏️ UPDATE PROFILE
// ==============================
export const updateEmployerProfileAPI = async (data) => {
  const res = await API.put("/employers/profile", data);
  return res.data;
};

// ==============================
// 🚪 LOGOUT
// ==============================
export const logoutEmployerAPI = async () => {
  const res = await API.post("/employers/logout");
  return res.data;
};