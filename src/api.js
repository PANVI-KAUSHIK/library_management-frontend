import axios from 'axios';

// In production, use same-origin relative /api base URL so requests go through Vercel proxy.
// For local development, keep http://localhost:8081/api.
const baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:8081/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
