import API from "./api";

// ==============================
// 🏢 CREATE COMPANY
// ==============================
export const createCompanyAPI = async (data) => {
  const res = await API.post("/companies", data);
  return res.data;
};

// ==============================
// 📥 GET MY COMPANY
// ==============================
export const getMyCompanyAPI = async () => {
  const res = await API.get("/companies/my");
  return res.data;
};

// ==============================
// 🔍 SEARCH COMPANY (JOIN EXISTING)
// ==============================
export const searchCompanyAPI = async (query) => {
  const res = await API.get("/companies/search", {
    params: { name: query },
  });
  return res.data;
};

// ==============================
// 🔗 JOIN COMPANY
// ==============================
export const joinCompanyAPI = async (companyId) => {
  const res = await API.post(`/companies/join/${companyId}`);
  return res.data;
};

// ==============================
// ✏️ UPDATE COMPANY
// ==============================
export const updateCompanyAPI = async (id, data) => {
  const res = await API.put(`/companies/${id}`, data);
  return res.data;
};