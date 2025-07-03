<template>
  <div class="page-container card">
    <h2>Profil Mahasiswa</h2>
    <p>Halaman ini akan menampilkan informasi pribadi Anda sebagai mahasiswa.</p>

    <!-- Tampilan Profil (Mode Baca) -->
    <div v-if="!isEditMode" class="profile-display">
      <ul>
        <li>Nama: <strong>{{ profileData.name }}</strong></li>
        <li>NIM: <strong>{{ profileData.nim || 'N/A' }}</strong></li>
        <li>Program Studi: <strong>{{ profileData.programStudi || 'N/A' }}</strong></li>
        <li>Email: <strong>{{ profileData.email }}</strong></li>
        <li>Semester: <strong>{{ profileData.semester || 'N/A' }}</strong></li>
      </ul>
      <button @click="openEditMode" class="btn btn-primary">Edit Profil</button>
    </div>

    <!-- Form Edit Profil (Mode Edit) -->
    <div v-else class="profile-edit-form">
      <h3>Edit Informasi Profil</h3>
      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label for="editName">Nama:</label>
          <input type="text" id="editName" v-model="editableProfile.name" required />
          <p v-if="formErrors.name" class="error-message">{{ formErrors.name }}</p>
        </div>
        <div class="form-group">
          <label for="editNIM">NIM:</label>
          <input type="text" id="editNIM" v-model="editableProfile.nim" />
        </div>
        <div class="form-group">
          <label for="editProgramStudi">Program Studi:</label>
          <input type="text" id="editProgramStudi" v-model="editableProfile.programStudi" />
        </div>
        <div class="form-group">
          <label for="editEmail">Email:</label>
          <input type="email" id="editEmail" v-model="editableProfile.email" disabled />
          <small>Email tidak dapat diubah.</small>
        </div>
        <div class="form-group">
          <label for="editSemester">Semester:</label>
          <input type="text" id="editSemester" v-model="editableProfile.semester" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
            Simpan Perubahan
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
          </button>
          <button type="button" @click="cancelEditMode" class="btn btn-secondary">Batal</button>
        </div>
        <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
        <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'; // Tambahkan watch
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Data reaktif untuk profil mahasiswa (mode baca)
const profileData = computed(() => ({
  name: authStore.user?.name || 'Nama Mahasiswa',
  nim: authStore.user?.nim || '',
  programStudi: authStore.user?.programStudi || '',
  semester: authStore.user?.semester || 'Ganjil 2023/2024',
  email: authStore.user?.email || 'mahasiswa@example.com'
}));

// State untuk mode edit
const isEditMode = ref(false);
const editableProfile = ref({});
const formErrors = ref({});

// --- Fungsi Mode Edit ---
const openEditMode = () => {
  console.log('openEditMode called.');
  console.log('authStore.user at openEditMode:', authStore.user);
  if (authStore.user && authStore.user.id) { // Pastikan user dan ID-nya ada
    editableProfile.value = { ...profileData.value };
    isEditMode.value = true;
    formErrors.value = {};
    console.log('Edit mode opened. editableProfile:', editableProfile.value);
  } else {
    console.error('User ID not available when trying to open edit mode. Please re-login.');
    alert('ID pengguna tidak ditemukan. Mohon coba login ulang.'); // Memberi tahu user
  }
};

const cancelEditMode = () => {
  isEditMode.value = false;
  formErrors.value = {};
};

const validateForm = () => {
  formErrors.value = {};
  if (!editableProfile.value.name) {
    formErrors.value.name = 'Nama wajib diisi.';
  }
  return Object.keys(formErrors.value).length === 0;
};

const saveProfile = async () => {
  console.log('saveProfile triggered.');
  console.log('authStore.user at saveProfile:', authStore.user);
  console.log('authStore.user?.uid at saveProfile:', authStore.user?.uid);

  if (!validateForm()) {
    return;
  }

  if (!authStore.user?.uid) {
    formErrors.value.general = 'Kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
    console.error('Error: authStore.user.uid is null or undefined during saveProfile.');
    return;
  }

  const success = await authStore.updateUserProfile(authStore.user.uid, {
    name: editableProfile.value.name,
    nim: editableProfile.value.nim,
    programStudi: editableProfile.value.programStudi,
    semester: editableProfile.value.semester,
  });

  if (success) {
    isEditMode.value = false;
    alert('Profil berhasil diperbarui!');
  } else {
    formErrors.value.general = authStore.error || 'Gagal memperbarui profil.';
  }
};

onMounted(() => {
  console.log('Profil.vue mounted. Initial authStore.user:', authStore.user);
  console.log('Profil.vue mounted. Initial authStore.user?.uid:', authStore.user?.uid);
});

// Watch authStore.user untuk memastikan editableProfile diinisialisasi jika user data dimuat setelah mount
watch(() => authStore.user, (newUser) => {
  if (newUser && newUser.id && !isEditMode.value) { // Hanya update jika bukan dalam mode edit
    console.log('authStore.user changed, updating profileData and editableProfile.');
    // Ini akan memicu profileData computed property untuk update
    // Jika Anda ingin editableProfile mencerminkan perubahan segera, Anda bisa set di sini juga
    // editableProfile.value = { ...profileData.value }; // Opsional, tergantung UX
  }
}, { immediate: true }); // Immediate agar berjalan saat mount jika user sudah ada
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
  margin-bottom: 2rem;
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

.btn {
  margin-top: 1rem;
}

/* Gaya untuk form edit */
.profile-edit-form {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
}

.profile-edit-form h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.form-group small {
  display: block;
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.25rem;
}
</style>
