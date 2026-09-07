import api from './api';

export const login = async (credentials) => {
  try {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success) {
      const { token, ...user } = res.data.data;
      return { user, token };
    }
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const register = async (userData) => {
  try {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, ...user } = res.data.data;
      return { user, token };
    }
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};
