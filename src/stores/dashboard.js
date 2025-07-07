import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

// Buat instance axios dengan URL dasar ke json-server Anda
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan port jika berbeda
});

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
          console.warn('Dashboard: User ID tidak tersedia. Summary tidak dapat dimuat.');
          this.isLoadingSummary = false;
          return;
        }

        // Ambil semua data yang relevan secara paralel
        const [
          mataKuliahResponse,
          tugasResponse,
          jadwalResponse,
          keuanganResponse,
        ] = await Promise.all([
          apiClient.get(`/mataKuliah?userId=${userId}`),
          apiClient.get(`/tugas?userId=${userId}`),
          apiClient.get(`/jadwal?userId=${userId}`),
          apiClient.get(`/keuangan?userId=${userId}`),
        ]);

        const mataKuliahUser = mataKuliahResponse.data;
        const tugasUser = tugasResponse.data;
        const jadwalUser = jadwalResponse.data;
        const keuanganUser = keuanganResponse.data;

        // Logika kalkulasi tetap sama
        const totalCoursesThisSemester = mataKuliahUser.filter(mk => mk.status === 'Aktif').length;
        const pendingAssignments = tugasUser.filter(t => !t.completed).length;
        
        const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' }); // Menggunakan locale Indonesia
        const todaySchedule = jadwalUser
          .filter(j => j.hari.toLowerCase() === today.toLowerCase())
          .map(j => `${j.mataKuliah} (${j.waktuMulai}-${j.waktuSelesai})`)
          .join(', ') || 'Tidak ada jadwal';

        const totalPemasukan = keuanganUser.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
        const totalPengeluaran = keuanganUser.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
        const balanceInfo = totalPemasukan - totalPengeluaran;

        const completedCourses = mataKuliahUser.filter(mk => mk.status === 'Selesai').length;

        this.dashboardSummary = {
          totalCoursesThisSemester,
          pendingAssignments,
          todaySchedule,
          balanceInfo,
          completedCourses,
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
        const notificationToSave = { ...activity, userId: userId, createdAt: new Date().toISOString() };
        await apiClient.post("/notifications", notificationToSave);
      } catch (err) {
        console.error('Error adding activity to log:', err.message);
      }
    },
  },
});
