import axiosClient from './axiosClient';

export const incomeApi = {
  getIncome: (params = {}) => axiosClient.get('/income', { params }),
  getIncomeById: (id) => axiosClient.get(`/income/${id}`),
  createIncome: (data) => axiosClient.post('/income', data),
  updateIncome: (id, data) => axiosClient.put(`/income/${id}`, data),
  deleteIncome: (id) => axiosClient.delete(`/income/${id}`)
};
