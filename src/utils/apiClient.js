import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika beda
});

export default apiClient;
