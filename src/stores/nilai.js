import { defineStore } from 'pinia';
import axios from 'axios';
import { useDashboardStore } from './dashboard';

// Instance axios bisa diimpor dari file konfigurasi terpusat
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika berbeda
});

export const useNilaiStore = defineStore('nilai', {
  state: () => ({
    nilaiList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * Mengambil semua nilai untuk pengguna tertentu dari json-server.
     * @param {string} userId - ID pengguna.
     */
    async fetchNilai(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/nilai?userId=${userId}`);
        this.nilaiList = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mengambil satu data nilai berdasarkan ID.
     * @param {string} id - ID nilai.
     * @param {string} userId - ID pengguna untuk verifikasi.
     * @returns {object|null}
     */
    async fetchNilaiById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/nilai/${id}`);
        if (response.data && response.data.userId === userId) {
          return response.data;
        } else {
          throw new Error(`Nilai tidak ditemukan atau Anda tidak memiliki akses.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Menambahkan data nilai baru.
     * @param {object} nilai - Data nilai baru.
     * @param {string} userId - ID pengguna.
     * @returns {boolean}
     */
    async addNilai(nilai, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const nilaiToSave = { ...nilai, userId: userId };
        const response = await apiClient.post('/nilai', nilaiToSave);
        this.nilaiList.push(response.data);

        // Perbarui ringkasan dashboard
        const dashboardStore = useDashboardStore();
        await dashboardStore.fetchDashboardSummary();

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Memperbarui data nilai yang ada.
     * @param {string} id - ID nilai.
     * @param {object} updatedNilai - Data nilai yang diperbarui.
     * @returns {boolean}
     */
    async updateNilai(id, updatedNilai) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/nilai/${id}`, updatedNilai);
        const index = this.nilaiList.findIndex(n => n.id === id);
        if (index !== -1) {
          this.nilaiList[index] = response.data;
        }

        // Perbarui ringkasan dashboard
        const dashboardStore = useDashboardStore();
        await dashboardStore.fetchDashboardSummary();

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Menghapus data nilai.
     * @param {string} id - ID nilai.
     * @returns {boolean}
     */
    async deleteNilai(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/nilai/${id}`);
        this.nilaiList = this.nilaiList.filter(n => n.id !== id);

        // Perbarui ringkasan dashboard
        const dashboardStore = useDashboardStore();
        await dashboardStore.fetchDashboardSummary();

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
