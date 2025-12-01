import { useCallback } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  withCredentials: true
});

const useAuth = () => {
  const initAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { user: data, token };
    } catch {
      localStorage.removeItem('accessToken');
      return null;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    return { user: data.user, token: data.accessToken };
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('accessToken', data.accessToken);
    return { user: data.user, token: data.accessToken };
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    } finally {
      localStorage.removeItem('accessToken');
    }
  }, []);

  return { initAuth, login, signup, logout };
};

export default useAuth;