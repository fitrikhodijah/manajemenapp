<template>
  <div class="dashboard-page">
    <!-- Tampilkan konten hanya jika pengguna terautentikasi -->
    <template v-if="authStore.isAuthenticated">
      <!-- Bagian Selamat Datang (Paling Atas) -->
      <section class="dashboard-info-section card">
        <h2>Selamat Datang di Dashboard Mahasiswa!</h2>
        <p>Gunakan navigasi di samping untuk mengakses fitur-fitur manajemen akademik Anda.</p>
        <ul>
          <li><span class="icon">📚</span> Kelola Mata Kuliah Anda.</li>
          <li><span class="icon">🗓️</span> Lihat dan atur Jadwal Kuliah.</li>
          <li><span class="icon">📝</span> Pantau Tugas & Deadline Anda.</li>
          <li><span class="icon">💰</span> Catat Pemasukan dan Pengeluaran Anda.</li>
        </ul>
      </section>

      <!-- Container untuk Kartu Metrik (Dihilangkan karena tidak ada lagi) -->
      <!-- Bagian Jadwal Hari Ini Dihilangkan Sepenuhnya -->
    </template>
    <template v-else>
      <!-- Opsional: Tampilkan pesan loading atau kosong jika belum terautentikasi -->
      <!-- Ini akan sangat singkat karena router akan segera mengalihkan -->
      <p>Mengalihkan ke halaman login...</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // Tambahkan watch
import { useRouter } from 'vue-router'; // Impor useRouter
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth';

const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const router = useRouter(); // Inisialisasi router

onMounted(async () => {
  // Hanya ambil data jika pengguna terautentikasi
  if (authStore.isAuthenticated && authStore.user?.id) {
    await dashboardStore.fetchDashboardSummary();
  }
});

// --- Perbaikan: Watcher untuk mengalihkan jika status autentikasi berubah ---
watch(() => authStore.isAuthenticated, (newVal) => {
  if (!newVal) {
    // Jika isAuthenticated menjadi false, alihkan ke halaman login
    router.push('/login');
  }
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column; /* Konten utama halaman tetap vertikal */
  gap: 1.5rem; /* Spasi antar bagian */
  width: 100%;
}

.dashboard-info-section {
  padding: 2rem;
  text-align: center;
  color: #555;
}

.dashboard-info-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.dashboard-info-section ul {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.dashboard-info-section li {
  background-color: #f0f2f5;
  border: 1px solid #ddd;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dashboard-info-section li .icon {
  font-size: 1.2rem;
  color: #6a6ee0;
}

/* Container untuk Kartu Metrik (Dihilangkan dari HTML) */
.metrics-cards-container {
  display: none;
}

/* Charts Section (Dihilangkan dari HTML dan CSS) */
.charts-section {
  display: none;
}
.chart-placeholder {
  display: none;
}
</style>
