import { defineStore } from 'pinia';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';
import { useDashboardStore } from './dashboard';
import { db } from '../main'; // Impor instance db dari main.js

export const useCatatanStore = defineStore('catatan', {
  state: () => ({
    catatanList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchCatatan(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance db yang diimpor
        const q = query(collection(db, "catatan"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.catatanList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCatatanById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance db yang diimpor
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

    async addCatatan(catatan, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance db yang diimpor
        const catatanToSave = { ...catatan, userId: userId };
        if (catatanToSave.id === undefined || catatanToSave.id === null) {
          delete catatanToSave.id;
        }
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

    async updateCatatan(id, updatedCatatan, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance db yang diimpor
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

    async deleteCatatan(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance db yang diimpor
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
