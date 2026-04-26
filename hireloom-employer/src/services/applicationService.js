import API from "./api";

// ✅ Get all applications (for employer dashboard)
export const getEmployerApplicationsAPI = async () => {
  const res = await API.get("/applications/employer");
  return res.data;
};

// ✅ Update status (shortlist / reject)
export const updateApplicationStatusAPI = async (id, status) => {
  const res = await API.put(`/applications/${id}`, { status });
  return res.data;
};