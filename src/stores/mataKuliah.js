import { defineStore } from 'pinia';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth'; // Impor store autentikasi untuk mendapatkan userId
import { useDashboardStore } from './dashboard'; // Impor store dashboard untuk memperbarui ringkasan

export const useMataKuliahStore = defineStore('mataKuliah', {
  state: () => ({
    mataKuliahList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchMataKuliah(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const q = query(collection(db, "mataKuliah"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.mataKuliahList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMataKuliahById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "mataKuliah", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error(`Mata Kuliah dengan ID ${id} tidak ditemukan atau bukan milik pengguna ini.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async addMataKuliah(mataKuliah, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        // --- Perbaikan di sini: Pastikan ID tidak disertakan saat addDoc ---
        const mataKuliahToSave = { ...mataKuliah, userId: userId };
        if (mataKuliahToSave.id === undefined || mataKuliahToSave.id === null) {
          delete mataKuliahToSave.id; // Hapus properti id jika undefined/null
        }
        // --- Akhir Perbaikan ---
        const docRef = await addDoc(collection(db, "mataKuliah"), mataKuliahToSave);
        this.mataKuliahList.push({ id: docRef.id, ...mataKuliahToSave });

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

    async updateMataKuliah(id, updatedMataKuliah, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const mataKuliahToUpdate = { ...updatedMataKuliah, userId: userId };
        const docRef = doc(db, "mataKuliah", id);
        await updateDoc(docRef, mataKuliahToUpdate);

        const index = this.mataKuliahList.findIndex(mk => mk.id === id);
        if (index !== -1) {
          this.mataKuliahList[index] = { id: id, ...mataKuliahToUpdate };
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

    async deleteMataKuliah(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "mataKuliah", id);
        await deleteDoc(docRef);

        await this.fetchMataKuliah(userId); // Ambil ulang setelah penghapusan

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
