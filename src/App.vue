<template>
  <div class="dashboard-layout">
    <Sidebar />

    <!-- Konten Utama -->
    <main class="main-content">
      <section class="main-content-header-card card">
        <h1>{{ currentRouteName }}</h1>
      </section>

      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; 
import Sidebar from '@/components/Sidebar.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userProfile = computed(() => ({
  name: authStore.user?.name || 'Guest',
  avatar: authStore.user?.avatar || 'https://via.placeholder.com/30'
}));

// Untuk menampilkan nama rute saat ini di header
const currentRouteName = computed(() => {
  if (route.name) {
    switch (route.name) {
      case 'Dashboard': return 'Dashboard';
      case 'MataKuliah':
      case 'AddMataKuliah':
      case 'EditMataKuliah': return 'Mata Kuliah';
      case 'Jadwal': return 'Jadwal Kuliah';
      case 'Tugas': return 'Tugas & Deadline';
      case 'Catatan': return 'Catatan';
      case 'Nilai': return 'Nilai & IPK';
      case 'Keuangan': return 'Keuangan';
      case 'Notifikasi': return 'Notifikasi';
      case 'Profil': return 'Profil Mahasiswa';
      case 'Login': return 'Login'; 
      case 'Register': return 'Register'; 
      default: return 'Aplikasi';
    }
  }
  return 'Aplikasi'; 
});

onMounted(() => {
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin: 20px;
  overflow: hidden;
}

/* Main Content Area */
.main-content {
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-left: 250px;
  width: calc(100% - 250px);
}

/* Header Card Baru */
.main-content-header-card {
  padding: 2rem;
  text-align: center;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.main-content-header-card h1 {
  font-size: 2.5rem;
  color: #6a6ee0;
  margin: 0;
  margin-bottom: 0.5rem;
}
</style>
