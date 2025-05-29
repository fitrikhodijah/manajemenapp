<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/tasks">Tugas</router-link>
      <router-link to="/history">Riwayat</router-link>
      <router-link to="/profile">Profil</router-link>
      <router-link to="/login">Logout</router-link>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Tidak perlu script tambahan untuk layout dasar ini
</script>

<style scoped>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.navbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #e0f3ec;
  border-radius: 8px;
}

.navbar a {
  color: #333;
  font-weight: bold;
}

.navbar a.router-link-active {
  color: #42b983;
  text-decoration: underline;
}

.main-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px #ddd;
}
</style>
