import axios from 'axios';

// In production on Vercel, use same-origin relative API base URL '/api'
// In local development, preserve fallback to http://localhost:8081/api
const isProduction = import.meta.env.PROD;
const baseURL = isProduction
  ? '/api'
  : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081/api');

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
