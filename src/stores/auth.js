import { defineStore } from 'pinia';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', 
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    tryAutoLogin() {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
      }
    },

    /**
     * Melakukan login dengan memeriksa data ke json-server.
     * PERHATIAN: Memeriksa password di sisi klien seperti ini TIDAK AMAN
     * dan hanya boleh digunakan untuk pengembangan lokal.
     */
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        // 1. Ambil pengguna berdasarkan email
        const response = await apiClient.get(`/users?email=${credentials.email}`);
        
        if (response.data.length === 0) {
          throw new Error("User dengan email tersebut tidak ditemukan.");
        }

        const user = response.data[0];

        // 2. Periksa password (tidak aman, hanya untuk demo)
        if (user.password !== credentials.password) {
          throw new Error("Password salah.");
        }

        // 3. Simpan state jika berhasil
        const { password, ...userDataToStore } = user; // Jangan simpan password di state
        this.user = userDataToStore;
        this.isAuthenticated = true;
        this.token = `mock-token-${user.id}`; // Buat token palsu

        localStorage.setItem('userToken', this.token);
        localStorage.setItem('userData', JSON.stringify(this.user));
        
        return true;
      } catch (err) {
        this.error = err.message;
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mendaftarkan pengguna baru ke db.json.
     */
    async register(userData) {
      this.isLoading = true;
      this.error = null;
      try {
        // Periksa apakah email sudah terdaftar
        const checkResponse = await apiClient.get(`/users?email=${userData.email}`);
        if (checkResponse.data.length > 0) {
          throw new Error("Email ini sudah terdaftar.");
        }

        // Buat pengguna baru
        await apiClient.post('/users', {
          name: userData.name,
          email: userData.email,
          password: userData.password, // Password disimpan sebagai teks biasa (tidak aman)
        });
        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Logout dengan membersihkan state dan localStorage.
     */
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.token = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      this.error = null;
    },

    /**
     * Memperbarui profil pengguna.
     */
    async updateUserProfile(uid, updatedProfileData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/users/${uid}`, updatedProfileData);

        // Update state dengan data terbaru dari server
        const { password, ...updatedUser } = response.data;
        this.user = updatedUser;
        localStorage.setItem('userData', JSON.stringify(this.user));

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
