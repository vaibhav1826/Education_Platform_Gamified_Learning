import { useMemo } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext.jsx';

const useApi = () => {
  const { accessToken } = useAuthContext();

  return useMemo(() => {
    const instance = axios.create({
      baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
      withCredentials: true
    });
    instance.interceptors.request.use((config) => {
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    });
    return instance;
  }, [accessToken]);
};

export default useApi;