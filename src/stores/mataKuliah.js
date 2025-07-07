import { defineStore } from 'pinia';
import apiClient from '../utils/apiClient'; // GUNAKAN apiClient dari file terpisah
import { useDashboardStore } from './dashboard';

export const useMataKuliahStore = defineStore('mataKuliah', {
  state: () => ({
    mataKuliahList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * Mengambil semua mata kuliah untuk pengguna tertentu dari json-server.
     * @param {string} userId - ID pengguna.
     */
    async fetchMataKuliah(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/mataKuliah?userId=${userId}`);
        this.mataKuliahList = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mengambil satu mata kuliah berdasarkan ID.
     * @param {string} id - ID mata kuliah.
     * @param {string} userId - ID pengguna untuk verifikasi.
     * @returns {object|null}
     */
    async fetchMataKuliahById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/mataKuliah/${id}`);
        if (response.data && response.data.userId === userId) {
          return response.data;
        } else {
          throw new Error(`Mata Kuliah tidak ditemukan atau Anda tidak memiliki akses.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Menambahkan mata kuliah baru.
     * @param {object} mataKuliah - Data mata kuliah baru.
     * @param {string} userId - ID pengguna.
     * @returns {boolean}
     */
    async addMataKuliah(mataKuliah, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const mataKuliahToSave = { ...mataKuliah, userId: userId };
        const response = await apiClient.post('/mataKuliah', mataKuliahToSave);
        this.mataKuliahList.push(response.data);

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
     * Memperbarui mata kuliah yang ada.
     * @param {string} id - ID mata kuliah.
     * @param {object} updatedMataKuliah - Data mata kuliah yang diperbarui.
     * @returns {boolean}
     */
    async updateMataKuliah(id, updatedMataKuliah) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/mataKuliah/${id}`, updatedMataKuliah);
        const index = this.mataKuliahList.findIndex(mk => mk.id === id);
        if (index !== -1) {
          this.mataKuliahList[index] = response.data;
        }

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
     * Menghapus mata kuliah.
     * @param {string} id - ID mata kuliah.
     * @returns {boolean}
     */
    async deleteMataKuliah(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/mataKuliah/${id}`);
        this.mataKuliahList = this.mataKuliahList.filter(mk => mk.id !== id);

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
