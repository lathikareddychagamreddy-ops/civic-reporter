// API Base URL - uses Vite environment variables
// For Vercel production, set VITE_API_URL environment variable
// For local development, defaults to localhost:5000
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
