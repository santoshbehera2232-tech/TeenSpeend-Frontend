import axiosClient from './axiosClient';

export const suggestionApi = {
  getSuggestions: () => axiosClient.get('/suggestions')
};
