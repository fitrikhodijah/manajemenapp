import { defineStore } from 'pinia';
import axios from 'axios';
import { useDashboardStore } from './dashboard';

// Instance axios bisa diimpor dari file konfigurasi terpusat
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika berbeda
});

export const useKeuanganStore = defineStore('keuangan', {
  state: () => ({
    transaksiList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * Mengambil semua transaksi untuk pengguna tertentu dari json-server.
     * @param {string} userId - ID pengguna.
     */
    async fetchTransaksi(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/keuangan?userId=${userId}`);
        this.transaksiList = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mengambil satu transaksi berdasarkan ID.
     * @param {string} id - ID transaksi.
     * @param {string} userId - ID pengguna untuk verifikasi.
     * @returns {object|null}
     */
    async fetchTransaksiById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/keuangan/${id}`);
        if (response.data && response.data.userId === userId) {
          return response.data;
        } else {
          throw new Error(`Transaksi tidak ditemukan atau Anda tidak memiliki akses.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Menambahkan transaksi baru.
     * @param {object} transaksi - Data transaksi baru.
     * @param {string} userId - ID pengguna.
     * @returns {boolean}
     */
    async addTransaksi(transaksi, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const transaksiToSave = { ...transaksi, userId: userId };
        const response = await apiClient.post('/keuangan', transaksiToSave);
        this.transaksiList.push(response.data);

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
     * Memperbarui transaksi yang ada.
     * @param {string} id - ID transaksi.
     * @param {object} updatedTransaksi - Data transaksi yang diperbarui.
     * @returns {boolean}
     */
    async updateTransaksi(id, updatedTransaksi) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/keuangan/${id}`, updatedTransaksi);
        const index = this.transaksiList.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transaksiList[index] = response.data;
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
     * Menghapus transaksi.
     * @param {string} id - ID transaksi.
     * @returns {boolean}
     */
    async deleteTransaksi(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/keuangan/${id}`);
        this.transaksiList = this.transaksiList.filter(t => t.id !== id);

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
