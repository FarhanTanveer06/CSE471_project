import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // Adjust baseURL if backend served separately
});

export default api;
