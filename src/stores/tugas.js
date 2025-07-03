import { defineStore } from 'pinia';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth'; // Impor store autentikasi
import { useDashboardStore } from './dashboard'; // Impor store dashboard

export const useTugasStore = defineStore('tugas', {
  state: () => ({
    tugasList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchTugas(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const q = query(collection(db, "tugas"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.tugasList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTugasById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "tugas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error(`Tugas dengan ID ${id} tidak ditemukan atau bukan milik pengguna ini.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async addTugas(tugas, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        // --- Perbaikan di sini: Pastikan ID tidak disertakan saat addDoc ---
        const tugasToSave = { ...tugas, userId: userId };
        if (tugasToSave.id === undefined || tugasToSave.id === null) {
          delete tugasToSave.id; // Hapus properti id jika undefined/null
        }
        // --- Akhir Perbaikan ---
        const docRef = await addDoc(collection(db, "tugas"), tugasToSave);
        this.tugasList.push({ id: docRef.id, ...tugasToSave });

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

    async updateTugas(id, updatedTugas, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const tugasToUpdate = { ...updatedTugas, userId: userId };
        const docRef = doc(db, "tugas", id);
        await updateDoc(docRef, tugasToUpdate);

        const index = this.tugasList.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tugasList[index] = { id: id, ...tugasToUpdate };
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

    async deleteTugas(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "tugas", id);
        await deleteDoc(docRef);

        await this.fetchTugas(userId);

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
