import api from "./axios";

export const settingsAPI = {
  // GET /api/settings
  getAll: () => api.get("/settings"),

  // PUT /api/settings
  update: (data) => api.put("/settings", data),
};
