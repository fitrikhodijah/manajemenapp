import { defineStore } from 'pinia';
import axios from 'axios';

// Buat instance axios dengan URL dasar ke json-server Anda
// Ini bisa dibuat di file terpisah dan diimpor jika digunakan di banyak tempat
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika berbeda
});

export const useCatatanStore = defineStore('catatan', {
  state: () => ({
    catatanList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * Aksi untuk mengambil semua catatan dari json-server untuk user tertentu.
     * @param {string} userId - ID pengguna yang catatannya akan diambil.
     */
    async fetchCatatan(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Mengambil catatan yang memiliki userId yang cocok
        const response = await apiClient.get(`/catatan?userId=${userId}`);
        this.catatanList = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aksi untuk mengambil satu catatan berdasarkan ID dari json-server.
     * @param {string} id - ID catatan yang akan diambil.
     * @param {string} userId - ID pengguna untuk verifikasi kepemilikan.
     * @returns {object|null} - Objek catatan jika ditemukan, null jika tidak.
     */
    async fetchCatatanById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/catatan/${id}`);
        
        // Verifikasi apakah catatan ini milik pengguna yang sedang login
        if (response.data && response.data.userId === userId) {
          return response.data;
        } else {
          throw new Error(`Catatan tidak ditemukan atau Anda tidak memiliki akses.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aksi untuk menambahkan catatan baru ke json-server.
     * @param {object} catatan - Objek catatan yang akan ditambahkan.
     * @param {string} userId - ID pengguna yang akan memiliki catatan ini.
     * @returns {boolean} - True jika berhasil, false jika gagal.
     */
    async addCatatan(catatan, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const catatanToSave = { ...catatan, userId: userId };
        const response = await apiClient.post('/catatan', catatanToSave);
        
        // Tambahkan catatan baru ke state lokal
        this.catatanList.push(response.data);

        // TODO: Panggil aksi untuk update dashboard jika diperlukan
        // const dashboardStore = useDashboardStore();
        // await dashboardStore.fetchDashboardSummary();

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aksi untuk memperbarui catatan yang sudah ada di json-server.
     * @param {string} id - ID catatan yang akan diperbarui.
     * @param {object} updatedCatatan - Objek catatan dengan data yang diperbarui.
     * @returns {boolean} - True jika berhasil, false jika gagal.
     */
    async updateCatatan(id, updatedCatatan) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.patch(`/catatan/${id}`, updatedCatatan);

        // Perbarui state lokal dengan data yang sudah diupdate
        const index = this.catatanList.findIndex(c => c.id === id);
        if (index !== -1) {
          this.catatanList[index] = response.data;
        }

        // TODO: Panggil aksi untuk update dashboard jika diperlukan
        // const dashboardStore = useDashboardStore();
        // await dashboardStore.fetchDashboardSummary();

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aksi untuk menghapus catatan dari json-server.
     * @param {string} id - ID catatan yang akan dihapus.
     * @returns {boolean} - True jika berhasil, false jika gagal.
     */
    async deleteCatatan(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/catatan/${id}`);

        // Hapus dari state lokal tanpa perlu fetch ulang
        this.catatanList = this.catatanList.filter(c => c.id !== id);

        // TODO: Panggil aksi untuk update dashboard jika diperlukan
        // const dashboardStore = useDashboardStore();
        // await dashboardStore.fetchDashboardSummary();

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
