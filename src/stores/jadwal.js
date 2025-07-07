import { defineStore } from 'pinia';
import axios from 'axios';
import { useDashboardStore } from './dashboard';

// Instance axios bisa diimpor dari file konfigurasi terpusat
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika berbeda
});

export const useJadwalStore = defineStore('jadwal', {
  state: () => ({
    jadwalList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * Mengambil semua jadwal untuk pengguna tertentu dari json-server.
     * @param {string} userId - ID pengguna.
     */
    async fetchJadwal(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/jadwal?userId=${userId}`);
        this.jadwalList = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mengambil satu jadwal berdasarkan ID.
     * @param {string} id - ID jadwal.
     * @param {string} userId - ID pengguna untuk verifikasi.
     * @returns {object|null}
     */
    async fetchJadwalById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/jadwal/${id}`);
        if (response.data && response.data.userId === userId) {
          return response.data;
        } else {
          throw new Error(`Jadwal tidak ditemukan atau Anda tidak memiliki akses.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Menambahkan jadwal baru.
     * @param {object} jadwal - Data jadwal baru.
     * @param {string} userId - ID pengguna.
     * @returns {boolean}
     */
    async addJadwal(jadwal, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const jadwalToSave = { ...jadwal, userId: userId };
        const response = await apiClient.post('/jadwal', jadwalToSave);
        this.jadwalList.push(response.data);

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
     * Memperbarui jadwal yang ada.
     * @param {string} id - ID jadwal.
     * @param {object} updatedJadwal - Data jadwal yang diperbarui.
     * @returns {boolean}
     */
    async updateJadwal(id, updatedJadwal) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/jadwal/${id}`, updatedJadwal);
        const index = this.jadwalList.findIndex(j => j.id === id);
        if (index !== -1) {
          this.jadwalList[index] = response.data;
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
     * Menghapus jadwal.
     * @param {string} id - ID jadwal.
     * @returns {boolean}
     */
    async deleteJadwal(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/jadwal/${id}`);
        this.jadwalList = this.jadwalList.filter(j => j.id !== id);

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
