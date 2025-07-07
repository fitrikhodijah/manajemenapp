import { defineStore } from 'pinia';
import axios from 'axios';
import { useDashboardStore } from './dashboard';

// Instance axios bisa diimpor dari file konfigurasi terpusat
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika berbeda
});

export const useTugasStore = defineStore('tugas', {
  state: () => ({
    tugasList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * Mengambil semua tugas untuk pengguna tertentu dari json-server.
     * @param {string} userId - ID pengguna.
     */
    async fetchTugas(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/tugas?userId=${userId}`);
        this.tugasList = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mengambil satu data tugas berdasarkan ID.
     * @param {string} id - ID tugas.
     * @param {string} userId - ID pengguna untuk verifikasi.
     * @returns {object|null}
     */
    async fetchTugasById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/tugas/${id}`);
        if (response.data && response.data.userId === userId) {
          return response.data;
        } else {
          throw new Error(`Tugas tidak ditemukan atau Anda tidak memiliki akses.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Menambahkan data tugas baru.
     * @param {object} tugas - Data tugas baru.
     * @param {string} userId - ID pengguna.
     * @returns {boolean}
     */
    async addTugas(tugas, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const tugasToSave = { ...tugas, userId: userId };
        const response = await apiClient.post('/tugas', tugasToSave);
        this.tugasList.push(response.data);

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
     * Memperbarui data tugas yang ada.
     * @param {string} id - ID tugas.
     * @param {object} updatedTugas - Data tugas yang diperbarui.
     * @returns {boolean}
     */
    async updateTugas(id, updatedTugas) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/tugas/${id}`, updatedTugas);
        const index = this.tugasList.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tugasList[index] = response.data;
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
     * Menghapus data tugas.
     * @param {string} id - ID tugas.
     * @returns {boolean}
     */
    async deleteTugas(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/tugas/${id}`);
        this.tugasList = this.tugasList.filter(t => t.id !== id);

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
