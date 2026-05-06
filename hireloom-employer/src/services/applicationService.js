import API from "./api";

// ✅ Get all applications (for employer dashboard)
export const getEmployerApplicationsAPI = async () => {
  const res = await API.get("/applications/employer");
  return res.data;
};

// ✅ Update status (shortlist / reject)
export const updateApplicationStatusAPI = async (applicationId, status) => {
  const res = await API.patch(`/applications/${applicationId}/status`, {
    status,
  });
  return res.data;
};

// 🏢 GET APPLICANTS FOR A JOB
export const getJobApplicationsAPI = async (jobId) => {
  const res = await API.get(`/applications/job/${jobId}/applicants`);
  console.log("API Response:", res.data); // Debug log
  return res.data;
};