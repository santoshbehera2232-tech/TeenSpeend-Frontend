import axiosClient from './axiosClient';

export const budgetApi = {
  getBudgets: (month, year) => axiosClient.get('/budgets', { params: { month, year } }),
  createBudget: (data) => axiosClient.post('/budgets', data),
  updateBudget: (id, data) => axiosClient.put(`/budgets/${id}`, data),
  deleteBudget: (id) => axiosClient.delete(`/budgets/${id}`)
};
