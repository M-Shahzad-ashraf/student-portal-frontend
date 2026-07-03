import api from "./axios";

export const authAPI = {
  // POST /api/auth/admin/login
  adminLogin: (credentials) => api.post("/auth/admin/login", credentials),

  // POST /api/auth/student/login
  studentLogin: (credentials) => api.post("/auth/student/login", credentials),

  // POST /api/auth/student/signup
  studentSignup: (data) => api.post("/auth/student/signup", data),

  // GET /api/auth/me
  getMe: () => api.get("/auth/me"),
};
