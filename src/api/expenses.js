import api from "./axios";

export const expensesAPI = {
  // GET /api/expenses
  getAll: () => api.get("/expenses"),

  // GET /api/expenses/:id
  getById: (id) => api.get(`/expenses/${id}`),

  // POST /api/expenses
  create: (data) => api.post("/expenses", data),

  // PUT /api/expenses/:id
  update: (id, data) => api.put(`/expenses/${id}`, data),

  // DELETE /api/expenses/:id
  delete: (id) => api.delete(`/expenses/${id}`),
};
