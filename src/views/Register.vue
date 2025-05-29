<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label>Nama:</label>
        <input type="text" v-model="name" required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Daftar</button>
    </form>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const success = ref('')
const router = useRouter()

const handleRegister = () => {
  // Simulasi registrasi
  console.log('Registrasi berhasil:', {
    name: name.value,
    email: email.value,
    password: password.value,
  })

  success.value = 'Registrasi berhasil! Silakan login.'
  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 10px;
}
.register-container input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
</style>
