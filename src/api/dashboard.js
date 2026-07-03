import api from "./axios";

export const dashboardAPI = {
  // GET /api/dashboard/stats
  getStats: () => api.get("/dashboard/stats"),

  // GET /api/dashboard/recent
  getRecent: () => api.get("/dashboard/recent"),
};
