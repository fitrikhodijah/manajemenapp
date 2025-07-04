import { defineStore } from 'pinia'; 
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';
import { db } from '../main';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardSummary: {
      totalCoursesThisSemester: 0,
      pendingAssignments: 0,
      todaySchedule: 'Tidak ada jadwal',
      balanceInfo: 0,
      completedCourses: 0,
    },
    isLoadingSummary: false,
    error: null,
  }),
  actions: {
    async fetchDashboardSummary() {
      this.isLoadingSummary = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        const userId = authStore.user?.id;

        if (!userId) {
          this.dashboardSummary = {
            totalCoursesThisSemester: 0,
            pendingAssignments: 0,
            todaySchedule: 'Tidak ada jadwal',
            balanceInfo: 0,
            completedCourses: 0,
          };
          console.warn('Dashboard: User ID tidak tersedia. Summary tidak dapat dimuat.');
          return;
        }

        const mataKuliahSnapshot = await getDocs(query(collection(db, "mataKuliah"), where("userId", "==", userId)));
        const mataKuliahUser = mataKuliahSnapshot.docs.map(doc => doc.data());

        const tugasSnapshot = await getDocs(query(collection(db, "tugas"), where("userId", "==", userId)));
        const tugasUser = tugasSnapshot.docs.map(doc => doc.data());

        const jadwalSnapshot = await getDocs(query(collection(db, "jadwal"), where("userId", "==", userId)));
        const jadwalUser = jadwalSnapshot.docs.map(doc => doc.data());

        const keuanganSnapshot = await getDocs(query(collection(db, "keuangan"), where("userId", "==", userId)));
        const keuanganUser = keuanganSnapshot.docs.map(doc => doc.data());

        const nilaiSnapshot = await getDocs(query(collection(db, "nilai"), where("userId", "==", userId)));
        const nilaiUser = nilaiSnapshot.docs.map(doc => doc.data());

        const totalCoursesThisSemester = mataKuliahUser.filter(mk => mk.status === 'Aktif').length;
        const pendingAssignments = tugasUser.filter(t => !t.completed).length;
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySchedule = jadwalUser.filter(j => j.hari === today).map(j => `${j.mataKuliah} (${j.waktuMulai}-${j.waktuSelesai})`).join(', ') || 'Tidak ada jadwal';

        const totalPemasukan = keuanganUser.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
        const totalPengeluaran = keuanganUser.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
        const balanceInfo = totalPemasukan - totalPengeluaran;

        const completedCourses = mataKuliahUser.filter(mk => mk.status === 'Selesai').length;

        this.dashboardSummary = {
          totalCoursesThisSemester: totalCoursesThisSemester,
          pendingAssignments: pendingAssignments,
          todaySchedule: todaySchedule,
          balanceInfo: balanceInfo,
          completedCourses: completedCourses,
        };

      } catch (err) {
        this.error = err.message;
        console.error('Error fetching dashboard summary:', err);
      } finally {
        this.isLoadingSummary = false;
      }
    },

    async addActivity(activity, userId) {
      try {
        const notificationToSave = { ...activity, userId: userId };
        await addDoc(collection(db, "notifications"), notificationToSave);
      } catch (err) {
        console.error('Error adding activity to log:', err.message);
      }
    },
  },
});
