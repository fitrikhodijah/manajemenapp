<template>
  <div class="profile-container">
    <h1>Profil Pengguna</h1>
    <form @submit.prevent="updateProfile">
      <div>
        <label>Nama:</label>
        <input type="text" v-model="user.name" required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" v-model="user.email" required />
      </div>
      <button type="submit">Simpan Perubahan</button>
    </form>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: 'Nama Pengguna',
  email: 'user@example.com',
})

const successMessage = ref('')

const updateProfile = () => {
  // Simulasi update profil
  successMessage.value = 'Profil berhasil diperbarui!'
  setTimeout(() => {
    successMessage.value = ''
  }, 2000)
}
</script>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 10px;
}
input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1.2rem;
}
.success {
  margin-top: 1rem;
  color: green;
}
</style>
