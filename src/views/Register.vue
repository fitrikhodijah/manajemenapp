<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nama:</label>
          <input type="text" id="name" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <!-- NIM dan Program Studi dihilangkan -->
        <!-- <div class="form-group">
          <label for="nim">NIM (Opsional):</label>
          <input type="text" id="nim" v-model="nim" />
        </div>
        <div class="form-group">
          <label for="programStudi">Program Studi (Opsional):</label>
          <input type="text" id="programStudi" v-model="programStudi" />
        </div> -->
        <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
          Register
          <span v-if="authStore.isLoading" class="loading-spinner"></span>
        </button>
        <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
      </form>
      <p class="auth-link">
        Sudah punya akun? <router-link to="/login">Login di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const name = ref('');
const email = ref('');
const password = ref('');
// nim dan programStudi dihilangkan dari state
// const nim = ref('');
// const programStudi = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    // nim dan programStudi tidak lagi disertakan
    // nim: nim.value,
    // programStudi: programStudi.value
  });
  if (success) {
    alert('Registrasi berhasil! Silakan login.'); // Gunakan modal kustom di aplikasi nyata
    router.push('/login');
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.auth-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.auth-card h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.auth-link {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #777;
}

.auth-link a {
  color: #6a6ee0;
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
