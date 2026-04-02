import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const registerDonor = async (data) => {
  const response = await api.post('/register/donor', data);
  return response.data;
};

export const registerHospital = async (data) => {
  const response = await api.post('/register/hospital', data);
  return response.data;
};

export const createBloodRequest = async (data) => {
  const response = await api.post('/request/blood', data);
  return response.data;
};

export const fetchNews = async () => {
  const response = await api.get('/news');
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const fetchRequestHistory = async () => {
  const response = await api.get('/history/requests');
  return response.data;
};

export const fetchDonors = async (bloodGroup = '', availableOnly = false) => {
  const response = await api.get('/donors', {
    params: {
      blood_group: bloodGroup,
      available_only: availableOnly
    }
  });
  return response.data;
};

export default api;
