<template>
  <div class="mata-kuliah-form-page">
    <div class="card">
      <h3>{{ isEditMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="namaMataKuliah">Nama Mata Kuliah:</label>
          <input type="text" id="namaMataKuliah" v-model="currentMataKuliah.namaMataKuliah" required />
          <p v-if="formErrors.namaMataKuliah" class="error-message">{{ formErrors.namaMataKuliah }}</p>
        </div>
        <div class="form-group">
          <label for="kodeMataKuliah">Kode Mata Kuliah:</label>
          <input type="text" id="kodeMataKuliah" v-model="currentMataKuliah.kodeMataKuliah" required />
          <p v-if="formErrors.kodeMataKuliah" class="error-message">{{ formErrors.kodeMataKuliah }}</p>
        </div>
        <div class="form-group">
          <label for="sks">SKS:</label>
          <input type="number" id="sks" v-model="currentMataKuliah.sks" required min="1" />
          <p v-if="formErrors.sks" class="error-message">{{ formErrors.sks }}</p>
        </div>
        <div class="form-group">
          <label for="semester">Semester:</label>
          <input type="text" id="semester" v-model="currentMataKuliah.semester" required />
          <p v-if="formErrors.semester" class="error-message">{{ formErrors.semester }}</p>
        </div>
        <div class="form-group">
          <label for="dosen">Dosen Pengampu:</label>
          <input type="text" id="dosen" v-model="currentMataKuliah.dosen" required />
          <p v-if="formErrors.dosen" class="error-message">{{ formErrors.dosen }}</p>
        </div>
        <div class="form-group">
          <label for="status">Status:</label>
          <select id="status" v-model="currentMataKuliah.status" required>
            <option value="">Pilih Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Selesai">Selesai</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
          <p v-if="formErrors.status" class="error-message">{{ formErrors.status }}</p>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="mataKuliahStore.isLoading">
            {{ isEditMode ? 'Update Mata Kuliah' : 'Simpan Mata Kuliah' }}
            <span v-if="mataKuliahStore.isLoading" class="loading-spinner"></span>
          </button>
          <button type="button" @click="router.back()" class="btn btn-secondary">Batal</button>
        </div>
        <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
        <p v-if="mataKuliahStore.error" class="error-message">{{ mataKuliahStore.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMataKuliahStore } from '@/stores/mataKuliah';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi

const route = useRoute();
const router = useRouter();
const mataKuliahStore = useMataKuliahStore();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore(); // Inisialisasi authStore

// Dapatkan userId dari authStore
const currentUserId = computed(() => authStore.user?.id);

const isEditMode = ref(false);
const mataKuliahId = ref(null);

const currentMataKuliah = ref({
  id: undefined,
  namaMataKuliah: '',
  kodeMataKuliah: '',
  sks: null,
  semester: '',
  dosen: '',
  status: '',
  userId: undefined, // Tambahkan properti userId
});

const formErrors = ref({});

watch(() => route.params.id, (newId) => {
  mataKuliahId.value = newId;
  isEditMode.value = !!newId;
  if (isEditMode.value) {
    // Pastikan userId tersedia saat memuat data untuk edit
    if (currentUserId.value) {
      loadMataKuliahData(newId, currentUserId.value);
    } else {
      console.error('User ID not available for loading course data. Please log in.');
      router.push('/mata-kuliah'); // Arahkan kembali jika userId tidak ada
    }
  } else {
    resetForm();
  }
}, { immediate: true });

const loadMataKuliahData = async (id, userId) => {
  const fetchedMataKuliah = await mataKuliahStore.fetchMataKuliahById(id, userId);
  if (fetchedMataKuliah) {
    currentMataKuliah.value = { ...fetchedMataKuliah };
  } else {
    console.error('Mata Kuliah tidak ditemukan atau bukan milik pengguna ini!');
    router.push('/mata-kuliah');
  }
};

const resetForm = () => {
  currentMataKuliah.value = {
    id: undefined,
    namaMataKuliah: '',
    kodeMataKuliah: '',
    sks: null,
    semester: '',
    dosen: '',
    status: '',
    userId: currentUserId.value, // Set userId untuk mata kuliah baru
  };
  formErrors.value = {};
};

const validateForm = () => {
  formErrors.value = {};
  if (!currentMataKuliah.value.namaMataKuliah) formErrors.value.namaMataKuliah = 'Nama mata kuliah wajib diisi.';
  if (!currentMataKuliah.value.kodeMataKuliah) formErrors.value.kodeMataKuliah = 'Kode mata kuliah wajib diisi.';
  if (!currentMataKuliah.value.sks || currentMataKuliah.value.sks <= 0) formErrors.value.sks = 'SKS wajib diisi dan harus lebih dari 0.';
  if (!currentMataKuliah.value.semester) formErrors.value.semester = 'Semester wajib diisi.';
  if (!currentMataKuliah.value.dosen) formErrors.value.dosen = 'Dosen pengampu wajib diisi.';
  if (!currentMataKuliah.value.status) formErrors.value.status = 'Status wajib diisi.';

  return Object.keys(formErrors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  if (!currentUserId.value) {
    console.error('User ID not available. Cannot save course.');
    formErrors.value.general = 'Terjadi kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
    return;
  }

  let success = false;
  let activityDescription = '';

  if (isEditMode.value) {
    if (!currentMataKuliah.value.id) {
      formErrors.value.general = 'Kesalahan: ID mata kuliah tidak ditemukan untuk pembaruan.';
      return;
    }
    success = await mataKuliahStore.updateMataKuliah(currentMataKuliah.value.id, currentMataKuliah.value, currentUserId.value);
    activityDescription = `Mata Kuliah "${currentMataKuliah.value.namaMataKuliah}" (ID: ${currentMataKuliah.value.id}) diperbarui`;
  } else {
    success = await mataKuliahStore.addMataKuliah(currentMataKuliah.value, currentUserId.value);
    activityDescription = `Mata Kuliah baru "${currentMataKuliah.value.namaMataKuliah}" ditambahkan`;
  }

  if (success) {
    dashboardStore.addActivity({
      date: new Date().toLocaleDateString('id-ID'),
      description: activityDescription,
      user: authStore.user?.name || 'Admin'
    });
    router.push('/mata-kuliah');
  }
};
</script>

<style scoped>
.mata-kuliah-form-page {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  min-width: 120px;
}
</style>
