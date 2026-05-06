import API from "./api";

// ONLY dashboard API here
export const getDashboardDataAPI = async () => {
  const res = await API.get("/employers/dashboard");
  return res.data;
};