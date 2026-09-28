import axiosClient from './axiosClient';

export const categoryApi = {
  getCategories: () => axiosClient.get('/categories'),
  createCategory: (data) => axiosClient.post('/categories', data),
  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`)
};
