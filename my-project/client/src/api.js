// API Base URL - uses Vite environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
