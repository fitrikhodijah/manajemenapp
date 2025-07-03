import { defineStore } from 'pinia';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth'; // Impor store autentikasi untuk mendapatkan userId
import { useDashboardStore } from './dashboard'; // Impor store dashboard untuk memperbarui ringkasan

export const useCatatanStore = defineStore('catatan', {
  state: () => ({
    catatanList: [], // State untuk menyimpan daftar catatan
    isLoading: false, // Status loading untuk operasi catatan
    error: null, // State untuk menyimpan pesan error
  }),
  actions: {
    /**
     * Aksi untuk mengambil semua catatan dari Firestore untuk user tertentu.
     * @param {string} userId - ID pengguna yang catatannya akan diambil.
     */
    async fetchCatatan(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const q = query(collection(db, "catatan"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.catatanList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aksi untuk mengambil satu catatan berdasarkan ID dari Firestore untuk user tertentu.
     * @param {string} id - ID catatan yang akan diambil.
     * @param {string} userId - ID pengguna yang catatannya akan diambil.
     * @returns {object|null} - Objek catatan jika ditemukan, null jika tidak.
     */
    async fetchCatatanById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "catatan", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error(`Catatan dengan ID ${id} tidak ditemukan atau bukan milik pengguna ini.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aksi untuk menambahkan catatan baru ke Firestore untuk user tertentu.
     * @param {object} catatan - Objek catatan yang akan ditambahkan.
     * @param {string} userId - ID pengguna yang akan memiliki catatan ini.
     * @returns {boolean} - True jika berhasil, false jika gagal.
     */
    async addCatatan(catatan, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        // --- Perbaikan di sini: Pastikan ID tidak disertakan saat addDoc ---
        const catatanToSave = { ...catatan, userId: userId };
        if (catatanToSave.id === undefined || catatanToSave.id === null) {
          delete catatanToSave.id; // Hapus properti id jika undefined/null
        }
        // --- Akhir Perbaikan ---
        const docRef = await addDoc(collection(db, "catatan"), catatanToSave);
        this.catatanList.push({ id: docRef.id, ...catatanToSave });

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
     * Aksi untuk memperbarui catatan yang sudah ada di Firestore untuk user tertentu.
     * @param {string} id - ID catatan yang akan diperbarui.
     * @param {object} updatedCatatan - Objek catatan dengan data yang diperbarui.
     * @param {string} userId - ID pengguna yang memiliki catatan ini.
     * @returns {boolean} - True jika berhasil, false jika gagal.
     */
    async updateCatatan(id, updatedCatatan, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const catatanToUpdate = { ...updatedCatatan, userId: userId };
        const docRef = doc(db, "catatan", id);
        await updateDoc(docRef, catatanToUpdate);

        const index = this.catatanList.findIndex(c => c.id === id);
        if (index !== -1) {
          this.catatanList[index] = { id: id, ...catatanToUpdate };
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
     * Aksi untuk menghapus catatan dari Firestore untuk user tertentu.
     * @param {string} id - ID catatan yang akan dihapus.
     * @param {string} userId - ID pengguna yang memiliki catatan ini.
     * @returns {boolean} - True jika berhasil, false jika gagal.
     */
    async deleteCatatan(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "catatan", id);
        await deleteDoc(docRef);

        await this.fetchCatatan(userId);

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
