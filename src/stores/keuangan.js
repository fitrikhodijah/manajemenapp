import { defineStore } from 'pinia';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';
import { useDashboardStore } from './dashboard'; 

export const useKeuanganStore = defineStore('keuangan', {
  state: () => ({
    transaksiList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchTransaksi(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const q = query(collection(db, "keuangan"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.transaksiList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTransaksiById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "keuangan", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error(`Transaksi dengan ID ${id} tidak ditemukan atau bukan milik pengguna ini.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async addTransaksi(transaksi, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // --- Perbaikan di sini: Pastikan ID tidak disertakan saat addDoc ---
        const transaksiToSave = { ...transaksi, userId: userId };
        if (transaksiToSave.id === undefined || transaksiToSave.id === null) {
          delete transaksiToSave.id; // Hapus properti id jika undefined/null
        }
        // --- Akhir Perbaikan ---

        const db = getFirestore();
        const docRef = await addDoc(collection(db, "keuangan"), transaksiToSave);
        this.transaksiList.push({ id: docRef.id, ...transaksiToSave });

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

    async updateTransaksi(id, updatedTransaksi, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const transaksiToUpdate = { ...updatedTransaksi, userId: userId };
        const docRef = doc(db, "keuangan", id);
        await updateDoc(docRef, transaksiToUpdate);

        const index = this.transaksiList.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transaksiList[index] = { id: id, ...transaksiToUpdate };
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

    async deleteTransaksi(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "keuangan", id);
        await deleteDoc(docRef);

        await this.fetchTransaksi(userId);

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
