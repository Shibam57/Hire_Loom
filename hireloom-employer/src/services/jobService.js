import API from "./api";

// ==============================
// ➕ CREATE JOB
// ==============================
export const createJobAPI = async (data) => {
  const res = await API.post("/jobs/post", data);
  return res.data;
};

// ==============================
// 📥 GET MY JOBS
// ==============================
export const getEmployerJobsAPI = async () => {
  const res = await API.get("/jobs/my");
  return res.data;
};

// ==============================
// 📄 GET SINGLE JOB
// ==============================
export const getJobByIdAPI = async (id) => {
  const res = await API.get(`/jobs/${id}`);
  return res.data;
};

// ==============================
// ✏️ UPDATE JOB
// ==============================
export const updateJobAPI = async (id, data) => {
  const res = await API.put(`/jobs/${id}`, data);
  return res.data;
};

// ==============================
// ❌ DELETE JOB
// ==============================
export const deleteJobAPI = async (id) => {
  const res = await API.delete(`/jobs/${id}`);
  return res.data;
};