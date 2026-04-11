import API from "./api"; // axios instance

// ==============================
// 📤 APPLY FOR JOB
// ==============================
export const applyJobAPI = async (jobId, formData) => {
  const res = await API.post(`/applications/${jobId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // for resume upload
    },
  });
  return res.data;
};

// ==============================
// 📥 GET MY APPLICATIONS
// ==============================
export const getMyApplicationsAPI = async () => {
  const res = await API.get("/applications/my");
  return res.data;
};

// ==============================
// 📄 GET SINGLE APPLICATION
// ==============================
export const getApplicationByIdAPI = async (id) => {
  const res = await API.get(`/applications/${id}`);
  return res.data;
};

// ==============================
// ❌ WITHDRAW APPLICATION
// ==============================
export const withdrawApplicationAPI = async (id) => {
  const res = await API.delete(`/applications/${id}`);
  return res.data;
};