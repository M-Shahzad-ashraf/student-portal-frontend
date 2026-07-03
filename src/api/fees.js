import api from "./axios";

export const feesAPI = {
  // GET /api/fees/overview?month=July&year=2026
  getOverview: (params) => api.get("/fees/overview", { params }),

  // GET /api/fees/report/monthly?month=June&year=2026
  getMonthlyReport: (month, year) =>
    api.get("/fees/report/monthly", { params: { month, year } }),

  // GET /api/fees/student/:studentId/summary
  getStudentSummary: (studentId) =>
    api.get(`/fees/student/${studentId}/summary`),

  // PUT /api/fees/student/:studentId/month/:month/year/:year
  updateFee: (studentId, month, year, data) =>
    api.put(`/fees/student/${studentId}/month/${month}/year/${year}`, data),

  // GET /api/fees/student/:studentId/challan/:month/:year (JSON)
  getChallan: (studentId, month, year) =>
    api.get(`/fees/student/${studentId}/challan/${month}/${year}`),

  // GET /api/fees/student/:studentId/challan/:month/:year/pdf (opens PDF)
  getChallanPdfUrl: (studentId, month, year) =>
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/fees/student/${studentId}/challan/${month}/${year}/pdf`,
};
