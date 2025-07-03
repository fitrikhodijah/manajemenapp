<template>
  <div class="mata-kuliah-page">
    <div class="header-actions">
      <h2>Daftar Mata Kuliah</h2>
      <!-- Tombol untuk menampilkan form tambah mata kuliah -->
      <button @click="openForm()" class="btn btn-primary">Tambah Mata Kuliah</button>
    </div>

    <!-- Form Tambah/Edit Mata Kuliah (akan muncul di halaman yang sama) -->
    <div v-if="showForm" class="mata-kuliah-form-section card">
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
          <button type="button" @click="closeForm" class="btn btn-secondary">Batal</button>
        </div>
        <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
        <p v-if="mataKuliahStore.error" class="error-message">{{ mataKuliahStore.error }}</p>
      </form>
    </div>

    <!-- Menampilkan status loading saat data sedang diambil -->
    <p v-if="mataKuliahStore.isLoading && !showForm">Memuat mata kuliah...</p>
    <!-- Menampilkan pesan error jika ada masalah saat mengambil data -->
    <p v-else-if="mataKuliahStore.error && !showForm" class="error-message">{{ mataKuliahStore.error }}</p>
    <!-- Menampilkan pesan jika tidak ada mata kuliah yang ditemukan dan form tidak aktif -->
    <div v-else-if="mataKuliahStore.mataKuliahList.length === 0 && !showForm" class="no-data-message card">
      <p>Belum ada mata kuliah. Silakan tambahkan mata kuliah baru.</p>
    </div>
    <!-- Menampilkan daftar mata kuliah dalam tabel jika ada data dan form tidak aktif -->
    <div v-else class="mata-kuliah-list card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Mata Kuliah</th>
            <th>Kode</th>
            <th>SKS</th>
            <th>Semester</th>
            <th>Dosen</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loop melalui setiap mata kuliah dari Pinia store -->
          <tr v-for="mk in mataKuliahStore.mataKuliahList" :key="mk.id">
            <td>{{ mk.id }}</td>
            <td>{{ mk.namaMataKuliah }}</td>
            <td>{{ mk.kodeMataKuliah }}</td>
            <td>{{ mk.sks }}</td>
            <td>{{ mk.semester }}</td>
            <td>{{ mk.dosen }}</td>
            <td>{{ mk.status }}</td>
            <td class="actions">
              <button @click="openForm(mk)" class="btn btn-secondary btn-small">Edit</button>
              <button @click="confirmDelete(mk.id)" class="btn btn-danger btn-small">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content card">
        <h3>Konfirmasi Hapus Mata Kuliah</h3>
        <p>Apakah Anda yakin ingin menghapus mata kuliah ini?</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Batal</button>
          <button @click="executeDelete" class="btn btn-danger">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMataKuliahStore } from '@/stores/mataKuliah';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi

const mataKuliahStore = useMataKuliahStore();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore(); // Inisialisasi authStore

// Dapatkan userId dari authStore
const currentUserId = computed(() => authStore.user?.id);

// --- State untuk Form Tambah/Edit ---
const showForm = ref(false);
const isEditMode = ref(false);
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

// --- State untuk Modal Konfirmasi Hapus ---
const showDeleteModal = ref(false);
const mataKuliahIdToDelete = ref(null);

// Lifecycle hook: Ambil daftar mata kuliah saat komponen dimuat
onMounted(() => {
  if (currentUserId.value) {
    mataKuliahStore.fetchMataKuliah(currentUserId.value);
  } else {
    console.error('User ID not available for fetching courses. Please log in.');
  }
});

// --- Fungsi untuk Form Tambah/Edit ---
const openForm = (mk = null) => {
  if (mk) {
    isEditMode.value = true;
    currentMataKuliah.value = { ...mk };
  } else {
    isEditMode.value = false;
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
  }
  formErrors.value = {};
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  isEditMode.value = false;
  formErrors.value = {};
  currentMataKuliah.value = {
    id: undefined,
    namaMataKuliah: '',
    kodeMataKuliah: '',
    sks: null,
    semester: '',
    dosen: '',
    status: '',
    userId: undefined,
  };
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
    closeForm();
  }
};

// --- Fungsi untuk Hapus Mata Kuliah ---
const confirmDelete = (id) => {
  mataKuliahIdToDelete.value = id;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  mataKuliahIdToDelete.value = null;
};

const executeDelete = async () => {
  if (mataKuliahIdToDelete.value && currentUserId.value) {
    const success = await mataKuliahStore.deleteMataKuliah(mataKuliahIdToDelete.value, currentUserId.value);
    if (success) {
      dashboardStore.addActivity({
        date: new Date().toLocaleDateString('id-ID'),
        description: `Mata Kuliah dengan ID ${mataKuliahIdToDelete.value} dihapus`,
        user: authStore.user?.name || 'Admin'
      });
      console.log(`Mata Kuliah dengan ID ${mataKuliahIdToDelete.value} berhasil dihapus.`);
    }
    cancelDelete();
  } else {
    console.error('User ID atau Mata Kuliah ID tidak tersedia untuk penghapusan.');
  }
};
</script>

<style scoped>
.mata-kuliah-page {
  width: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions h2 {
  margin: 0;
  color: #333;
}

.mata-kuliah-form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.mata-kuliah-form-section h3 {
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

.mata-kuliah-list {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  color: #777;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table .actions {
  display: flex;
  gap: 0.5rem;
}

.no-data-message {
  padding: 2rem;
  text-align: center;
  color: #777;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: #555;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
