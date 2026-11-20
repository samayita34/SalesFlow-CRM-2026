import api from './axios';

export const activityApi = {
  getActivities: async (params = {}) => {
    const response = await api.get('/activities', { params });
    return response.data;
  },

  createActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
};
