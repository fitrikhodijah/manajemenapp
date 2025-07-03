<template>
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="app-title">Manajemen Mahasiswa</span>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <!-- Dashboard -->
          <li class="nav-item" :class="{ 'active': route.path === '/' }">
            <a href="#" @click.prevent="router.push('/')">
              <span class="icon">📊</span> <!-- Ikon Unicode -->
              <span class="link-name">Dashboard</span>
            </a>
          </li>
          <!-- Mata Kuliah -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/mata-kuliah') }">
            <a href="#" @click.prevent="router.push('/mata-kuliah')">
              <span class="icon">📚</span> <!-- Ikon Unicode -->
              <span class="link-name">Mata Kuliah</span>
            </a>
          </li>
          <!-- Jadwal Kuliah -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/jadwal') }">
            <a href="#" @click.prevent="router.push('/jadwal')">
              <span class="icon">🗓️</span> <!-- Ikon Unicode -->
              <span class="link-name">Jadwal Kuliah</span>
            </a>
          </li>
          <!-- Tugas & Deadline -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/tugas') }">
            <a href="#" @click.prevent="router.push('/tugas')">
              <span class="icon">📝</span> <!-- Ikon Unicode -->
              <span class="link-name">Tugas & Deadline</span>
            </a>
          </li>
          <!-- Catatan -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/catatan') }">
            <a href="#" @click.prevent="router.push('/catatan')">
              <span class="icon">🗒️</span> <!-- Ikon Unicode -->
              <span class="link-name">Catatan</span>
            </a>
          </li>
          <!-- Nilai & IPK -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/nilai') }">
            <a href="#" @click.prevent="router.push('/nilai')">
              <span class="icon">📈</span> <!-- Ikon Unicode -->
              <span class="link-name">Nilai & IPK</span>
            </a>
          </li>
          <!-- Keuangan -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/keuangan') }">
            <a href="#" @click.prevent="router.push('/keuangan')">
              <span class="icon">💰</span> <!-- Ikon Unicode -->
              <span class="link-name">Keuangan</span>
            </a>
          </li>
          <!-- Profil -->
          <li class="nav-item" :class="{ 'active': route.path.startsWith('/profil') }">
            <a href="#" @click.prevent="router.push('/profil')">
              <span class="icon">👤</span> <!-- Ikon Unicode -->
              <span class="link-name">Profil</span>
            </a>
          </li>
  
          <!-- Tombol Login/Logout Kondisional -->
          <li class="nav-item logout-btn">
            <template v-if="authStore.isAuthenticated">
              <a href="#" @click.prevent="handleLogout">
                <span class="icon">🚪</span> <!-- Ikon Unicode -->
                Logout
              </a>
            </template>
            <template v-else>
              <router-link to="/login">
                <span class="icon">🔑</span> <!-- Ikon Unicode -->
                Login
              </router-link>
            </template>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  
  const handleLogout = () => {
    authStore.logout();
    router.push('/login');
  };
  </script>
  
  <style scoped>
  /* Variabel CSS */
  :root {
    --sidebar-width: 250px;
    --sidebar-bg-color: #ffffff;
    --sidebar-border-color: #eee;
    --sidebar-text-color: #707070;
    --sidebar-active-bg-color: #e6e7fb;
    --sidebar-active-text-color: #6a6ee0;
    --sidebar-hover-bg-color: #f0f2f5;
    --sidebar-logo-color: #6a6ee0; /* Warna logo teks */
  }
  
  .sidebar {
    width: 250px;
    background-color: var(--sidebar-bg-color);
    padding: 2rem 1.5rem;
    border-right: 1px solid var(--sidebar-border-color);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }
  
  .sidebar::-webkit-scrollbar {
    display: none;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center; /* Pusatkan teks "Manajemen Mahasiswa" */
    margin-bottom: 2rem;
    padding: 0 0.5rem;
  }
  
  .app-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--sidebar-logo-color); /* Menggunakan variabel warna logo */
    text-align: center;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .nav-item a {
    text-decoration: none;
    color: var(--sidebar-text-color);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    width: 100%;
    transition: background-color 0.2s, color 0.2s;
    overflow: hidden; /* Tambahkan untuk memastikan konten tidak meluber */
  }
  
  .nav-item .icon {
    /* Gaya untuk ikon Unicode/emoji */
    font-size: 1.5rem; /* Ukuran ikon yang konsisten dan lebih besar untuk emoji */
    margin-right: 10px;
    color: #777; /* Warna default ikon */
    width: 30px; /* Lebar tetap untuk menampung ikon dan memastikan penyejajaran */
    height: 30px; /* Tinggi tetap agar ikon terpusat vertikal */
    text-align: center;
    display: flex;
    justify-content: center; /* Pusatkan ikon horizontal dalam lebar tetap */
    align-items: center; /* Pusatkan ikon vertikal dalam tinggi tetap */
    flex-shrink: 0;
  }
  
  .nav-item .link-name {
    overflow: hidden; /* Pastikan teks terpotong jika terlalu panjang setelah wrap */
    text-overflow: ellipsis; /* Tambahkan ellipsis jika teks terpotong */
    white-space: nowrap; /* Teks tidak membungkus, akan dipotong dengan ellipsis jika overflow */
  }
  
  /* Gaya untuk rute aktif */
  .nav-item.active a {
    background-color: var(--sidebar-active-bg-color);
    color: var(--sidebar-active-text-color);
    font-weight: 500;
  }
  
  .nav-item.active a .icon {
    color: var(--sidebar-active-text-color);
  }
  
  /* Gaya hover */
  .nav-item a:hover {
    background-color: var(--sidebar-hover-bg-color);
    color: #333;
  }
  
  .nav-item a:hover .icon {
    color: #333;
  }
  
  /* Gaya Logout Button Disesuaikan agar mirip nav-item biasa */
  .logout-btn {
    margin-top: auto;
    cursor: pointer;
    margin-bottom: 0.75rem;
  }
  
  .logout-btn a {
    color: var(--sidebar-text-color);
    justify-content: flex-start;
  }
  
  .logout-btn a:hover {
    background-color: var(--sidebar-hover-bg-color);
    color: #333;
  }
  
  .logout-btn a .icon {
    color: #d9534f;
  }
  
  .logout-btn a:hover .icon {
    color: #d9534f;
  }
  </style>
  