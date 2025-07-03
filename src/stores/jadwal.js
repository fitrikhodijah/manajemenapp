import { defineStore } from 'pinia';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth'; // Impor store autentikasi untuk mendapatkan userId
import { useDashboardStore } from './dashboard'; // Impor store dashboard untuk memperbarui ringkasan

export const useJadwalStore = defineStore('jadwal', {
  state: () => ({
    jadwalList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchJadwal(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const q = query(collection(db, "jadwal"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.jadwalList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchJadwalById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "jadwal", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error(`Jadwal dengan ID ${id} tidak ditemukan atau bukan milik pengguna ini.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async addJadwal(jadwal, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        // --- Perbaikan di sini: Pastikan ID tidak disertakan saat addDoc ---
        const jadwalToSave = { ...jadwal, userId: userId };
        if (jadwalToSave.id === undefined || jadwalToSave.id === null) {
          delete jadwalToSave.id; // Hapus properti id jika undefined/null
        }
        // --- Akhir Perbaikan ---
        const docRef = await addDoc(collection(db, "jadwal"), jadwalToSave);
        this.jadwalList.push({ id: docRef.id, ...jadwalToSave });

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

    async updateJadwal(id, updatedJadwal, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const jadwalToUpdate = { ...updatedJadwal, userId: userId };
        const docRef = doc(db, "jadwal", id);
        await updateDoc(docRef, jadwalToUpdate);

        const index = this.jadwalList.findIndex(j => j.id === id);
        if (index !== -1) {
          this.jadwalList[index] = { id: id, ...jadwalToUpdate };
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

    async deleteJadwal(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "jadwal", id);
        await deleteDoc(docRef);

        await this.fetchJadwal(userId);

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
