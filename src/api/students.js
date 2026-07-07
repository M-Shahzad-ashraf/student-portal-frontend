import api from "./axios";

export const studentsAPI = {
  // GET /api/students
  getAll: (params) => api.get("/students", { params }),

  // GET /api/students/:id
  getById: (id) => api.get(`/students/${id}`),

  // POST /api/students
  create: (data) => api.post("/students", data),

  // PUT /api/students/:id
  update: (id, data) => api.put(`/students/${id}`, data),

  // DELETE /api/students/:id
  delete: (id) => api.delete(`/students/${id}`),

  // POST /api/students/import
  import: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    // Let axios set Content-Type with boundary — manual header breaks upload
    return api.post("/students/import", formData);
  },

  // GET /api/students/export with flexible params
  exportData: (params) =>
    api.get("/students/export", { params, responseType: "blob" }),

  // GET /api/students/export (flexible signature supporting both format string and params object)
  export: (formatOrParams) => {
    if (typeof formatOrParams === "object") {
      return api.get("/students/export", { params: formatOrParams, responseType: "blob" });
    }
    return api.get(`/students/export?format=${formatOrParams}`, { responseType: "blob" });
  },
};
