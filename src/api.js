import axios from 'axios';

// Normalize baseURL so it always has the /api context path, regardless of trailing slashes
let rawBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081/api';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true,
});

export default api;
