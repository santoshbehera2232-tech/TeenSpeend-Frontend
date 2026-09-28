import axiosClient from './axiosClient';

export const analyticsApi = {
  getDashboard: (month, year) => axiosClient.get('/analytics/dashboard', { params: { month, year } })
};
