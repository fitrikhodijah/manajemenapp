<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <span class="app-title" v-if="!isCollapsed">Manajemen Mahasiswa</span>
      <button class="toggle-btn" @click="toggleSidebar">
        <span v-if="isCollapsed">➡️</span>
        <span v-else>⬅️</span>
      </button>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li class="nav-item" :class="{ 'active': route.path === '/' }">
          <a href="#" @click.prevent="router.push('/')">
            <span class="icon">📊</span>
            <span v-if="!isCollapsed" class="link-name">Dashboard</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/mata-kuliah') }">
          <a href="#" @click.prevent="router.push('/mata-kuliah')">
            <span class="icon">📚</span>
            <span v-if="!isCollapsed" class="link-name">Mata Kuliah</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/jadwal') }">
          <a href="#" @click.prevent="router.push('/jadwal')">
            <span class="icon">🗓️</span>
            <span v-if="!isCollapsed" class="link-name">Jadwal Kuliah</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/tugas') }">
          <a href="#" @click.prevent="router.push('/tugas')">
            <span class="icon">📝</span>
            <span v-if="!isCollapsed" class="link-name">Tugas</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/catatan') }">
          <a href="#" @click.prevent="router.push('/catatan')">
            <span class="icon">🗒️</span>
            <span v-if="!isCollapsed" class="link-name">Catatan</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/nilai') }">
          <a href="#" @click.prevent="router.push('/nilai')">
            <span class="icon">📈</span>
            <span v-if="!isCollapsed" class="link-name">Nilai</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/keuangan') }">
          <a href="#" @click.prevent="router.push('/keuangan')">
            <span class="icon">💰</span>
            <span v-if="!isCollapsed" class="link-name">Keuangan</span>
          </a>
        </li>
        <li class="nav-item" :class="{ 'active': route.path.startsWith('/profil') }">
          <a href="#" @click.prevent="router.push('/profil')">
            <span class="icon">👤</span>
            <span v-if="!isCollapsed" class="link-name">Profil</span>
          </a>
        </li>
        <li class="nav-item logout-btn">
          <template v-if="authStore.isAuthenticated">
            <a href="#" @click.prevent="handleLogout">
              <span class="icon">🚪</span>
              <span v-if="!isCollapsed">Logout</span>
            </a>
          </template>
          <template v-else>
            <router-link to="/login">
              <span class="icon">🔑</span>
              <span v-if="!isCollapsed">Login</span>
            </router-link>
          </template>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  transition: width 0.3s ease;
  background-color: #ffffff;
  padding: 1rem;
  border-right: 1px solid #eee;
  height: 100vh;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}
.sidebar.collapsed {
  width: 80px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.app-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6a6ee0;
}
.toggle-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item {
  margin-bottom: 0.5rem;
}
.nav-item a,
.nav-item router-link {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.75rem;
  text-decoration: none;
  color: #707070;
  border-radius: 8px;
  transition: background-color 0.2s, color 0.2s;
}
.nav-item.active a {
  background-color: #e6e7fb;
  color: #6a6ee0;
  font-weight: 500;
}
.nav-item .icon {
  font-size: 1.5rem;
  margin-right: 12px;
  min-width: 24px;
  text-align: center;
}
.sidebar.collapsed .link-name {
  display: none;
}
.sidebar.collapsed .app-title {
  display: none;
}
.logout-btn {
  margin-top: auto;
}
.nav-item a:hover {
  background-color: #f0f2f5;
}
</style>
