const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const endpoints = {
  labs: '/labs',
};