<template>
  <div class="page-container card">
    <h2>Profil Mahasiswa</h2>
    <p>Halaman ini akan menampilkan informasi pribadi Anda sebagai mahasiswa.</p>

    <div class="profile-display">
      <ul>
        <li>Nama: <strong>{{ profileData.name }}</strong></li>
        <li>Email: <strong>{{ profileData.email }}</strong></li>
        </ul>
      </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'; // ref, onMounted, watch tidak diperlukan lagi
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Data reaktif untuk profil mahasiswa (mode baca saja)
const profileData = computed(() => ({
  name: authStore.user?.name || 'Nama Mahasiswa',
  email: authStore.user?.email || 'mahasiswa@example.com'
  // nim, programStudi, semester tidak lagi diambil atau ditampilkan
}));

// isEditMode, editableProfile, formErrors dihilangkan
// openEditMode, cancelEditMode, validateForm, saveProfile dihilangkan
// onMounted dan watch dihilangkan
</script>

<style scoped>
.page-container {
  padding: 2rem;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

p {
  color: #555;
  margin-bottom: 1.5rem;
}

ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
  text-align: left;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem; /* Tetap pertahankan margin bawah jika ada tombol lain di bawahnya */
}

li {
  background-color: #f8f9fa;
  border: 1px solid #eee;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

li strong {
  color: #6a6ee0;
}

</style>
