import axiosClient from './axiosClient';

export const expenseApi = {
  getExpenses: (params = {}) => axiosClient.get('/expenses', { params }),
  getExpenseById: (id) => axiosClient.get(`/expenses/${id}`),
  createExpense: (data) => axiosClient.post('/expenses', data),
  updateExpense: (id, data) => axiosClient.put(`/expenses/${id}`, data),
  deleteExpense: (id) => axiosClient.delete(`/expenses/${id}`)
};
