import API from "./api"; // 👈 your axios instance with interceptors

// ==============================
// 📥 GET ALL JOBS
// ==============================
export const getJobsAPI = async (params = {}) => {
  // params: { keyword, location, skill }
  const res = await API.get("/jobs", { params });
  console.log("API RESPONSE:", res.data);
  return res.data;
};

// ==============================
// 📄 GET SINGLE JOB
// ==============================
export const getJobByIdAPI = async (jobId) => {
  const res = await API.get(`/jobs/${jobId}`);
  console.log("API RESPONSE:", res.data.data);
  return res.data;
};

// ==============================
// 🔍 FILTER JOBS (OPTIONAL)
// ==============================
export const filterJobsAPI = async (filters) => {
  const res = await API.get("/jobs/filter", {
    params: filters, // { skill, location, salary }
  });
  return res.data;
};

// ==============================
// 📤 APPLY FOR JOB
// ==============================
export const applyJobAPI = async (jobId, formData) => {
  const res = await API.post(`/applications/${jobId}`, formData);
  return res.data;
};

// ==============================
// 📌 SAVE JOB (OPTIONAL FEATURE)
// ==============================
export const saveJobAPI = async (jobId) => {
  const res = await API.post(`/jobs/save/${jobId}`);
  return res.data;
};

// ==============================
// ❌ UNSAVE JOB
// ==============================
export const unsaveJobAPI = async (jobId) => {
  const res = await API.delete(`/jobs/save/${jobId}`);
  return res.data;
};