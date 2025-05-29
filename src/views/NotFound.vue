<template>
  <div class="not-found-container">
    <h1>404 - Halaman Tidak Ditemukan</h1>
    <p>Oops! Halaman yang Anda cari tidak tersedia.</p>
    <router-link to="/dashboard">
      <button>Kembali ke Dashboard</button>
    </router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-container {
  text-align: center;
  padding: 60px 20px;
}
button {
  margin-top: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
