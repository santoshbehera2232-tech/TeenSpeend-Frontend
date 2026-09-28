import axiosClient from './axiosClient';

export const savingsApi = {
  getSavingsGoals: () => axiosClient.get('/savings-goals'),
  createSavingsGoal: (data) => axiosClient.post('/savings-goals', data),
  updateSavingsGoal: (id, data) => axiosClient.put(`/savings-goals/${id}`, data),
  deleteSavingsGoal: (id) => axiosClient.delete(`/savings-goals/${id}`)
};
