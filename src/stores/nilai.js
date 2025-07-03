import { defineStore } from 'pinia';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';
import { useDashboardStore } from './dashboard';

export const useNilaiStore = defineStore('nilai', {
  state: () => ({
    nilaiList: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchNilai(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const q = query(collection(db, "nilai"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        this.nilaiList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchNilaiById(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "nilai", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error(`Nilai dengan ID ${id} tidak ditemukan atau bukan milik pengguna ini.`);
        }
      } catch (err) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async addNilai(nilai, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const nilaiToSave = { ...nilai, userId: userId };
        const docRef = await addDoc(collection(db, "nilai"), nilaiToSave);
        this.nilaiList.push({ id: docRef.id, ...nilaiToSave });

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

    async updateNilai(id, updatedNilai, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const nilaiToUpdate = { ...updatedNilai, userId: userId };
        const docRef = doc(db, "nilai", id);
        await updateDoc(docRef, nilaiToUpdate);

        const index = this.nilaiList.findIndex(n => n.id === id);
        if (index !== -1) {
          this.nilaiList[index] = { id: id, ...nilaiToUpdate };
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

    async deleteNilai(id, userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore();
        const docRef = doc(db, "nilai", id);
        await deleteDoc(docRef);

        await this.fetchNilai(userId);

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
