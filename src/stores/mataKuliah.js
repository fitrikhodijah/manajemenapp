import { defineStore } from 'pinia';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { useDashboardStore } from './dashboard';
import { db } from '../main';

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
        const mataKuliahToSave = { ...mataKuliah, userId: userId };
        if (mataKuliahToSave.id === undefined || mataKuliahToSave.id === null) {
          delete mataKuliahToSave.id;
        }
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
        const docRef = doc(db, "mataKuliah", id);
        await deleteDoc(docRef);

        await this.fetchMataKuliah(userId);

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
