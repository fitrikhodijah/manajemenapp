<template>
  <div class="tugas-page">
    <div class="header-actions">
      <h2>Manajemen Tugas & Deadline</h2>
      <!-- Tombol untuk menampilkan form tambah tugas -->
      <button @click="openForm()" class="btn btn-primary">Tambah Tugas</button>
    </div>

    <!-- Form Tambah/Edit Tugas (akan muncul di halaman yang sama) -->
    <div v-if="showForm" class="tugas-form-section card">
      <h3>{{ isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="judul">Judul Tugas:</label>
          <input type="text" id="judul" v-model="currentTugas.judul" required />
          <p v-if="formErrors.judul" class="error-message">{{ formErrors.judul }}</p>
        </div>
        <div class="form-group">
          <label for="deskripsi">Deskripsi:</label>
          <textarea id="deskripsi" v-model="currentTugas.deskripsi"></textarea>
        </div>
        <div class="form-group">
          <label for="tenggatWaktu">Tenggat Waktu:</label>
          <input type="date" id="tenggatWaktu" v-model="currentTugas.tenggatWaktu" required />
          <p v-if="formErrors.tenggatWaktu" class="error-message">{{ formErrors.tenggatWaktu }}</p>
        </div>
        <div class="form-group">
          <label for="fileLampiran">File Lampiran (URL):</label>
          <input type="text" id="fileLampiran" v-model="currentTugas.fileLampiran" />
        </div>
        <div class="form-group">
          <input type="checkbox" id="completed" v-model="currentTugas.completed" />
          <label for="completed" class="inline-label">Tugas Selesai</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="tugasStore.isLoading">
            {{ isEditMode ? 'Update Tugas' : 'Simpan Tugas' }}
            <span v-if="tugasStore.isLoading" class="loading-spinner"></span>
          </button>
          <button type="button" @click="closeForm" class="btn btn-secondary">Batal</button>
        </div>
        <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
        <p v-if="tugasStore.error" class="error-message">{{ tugasStore.error }}</p>
      </form>
    </div>

    <!-- Menampilkan status loading saat data sedang diambil -->
    <p v-if="tugasStore.isLoading && !showForm">Memuat tugas...</p>
    <!-- Menampilkan pesan error jika ada masalah saat mengambil data -->
    <p v-else-if="tugasStore.error && !showForm" class="error-message">{{ tugasStore.error }}</p>
    <!-- Menampilkan pesan jika tidak ada tugas yang ditemukan dan form tidak aktif -->
    <div v-else-if="tugasStore.tugasList.length === 0 && !showForm" class="no-data-message card">
      <p>Belum ada tugas. Silakan tambahkan tugas baru.</p>
    </div>
    <!-- Menampilkan daftar tugas dalam tabel jika ada data dan form tidak aktif -->
    <div v-else class="tugas-list card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul</th>
            <th>Deskripsi</th>
            <th>Tenggat Waktu</th>
            <th>Selesai</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tugas in tugasStore.tugasList" :key="tugas.id">
            <td>{{ tugas.id }}</td>
            <td>{{ tugas.judul }}</td>
            <td>{{ tugas.deskripsi }}</td>
            <td>{{ tugas.tenggatWaktu }}</td>
            <td>
              <input type="checkbox" v-model="tugas.completed" @change="updateTugasCompletion(tugas)" />
            </td>
            <td class="actions">
              <button @click="openForm(tugas)" class="btn btn-secondary btn-small">Edit</button>
              <button @click="confirmDelete(tugas.id)" class="btn btn-danger btn-small">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content card">
        <h3>Konfirmasi Hapus Tugas</h3>
        <p>Apakah Anda yakin ingin menghapus tugas ini?</p>
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
import { useTugasStore } from '@/stores/tugas';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi

const tugasStore = useTugasStore();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore(); // Inisialisasi authStore

// Dapatkan userId dari authStore
const currentUserId = computed(() => authStore.user?.id);

// --- State untuk Form Tambah/Edit ---
const showForm = ref(false);
const isEditMode = ref(false);
const currentTugas = ref({
  id: undefined,
  judul: '',
  deskripsi: '',
  tenggatWaktu: '',
  completed: false,
  fileLampiran: '',
  userId: undefined, // Tambahkan properti userId
});
const formErrors = ref({});

// --- State untuk Modal Konfirmasi Hapus ---
const showDeleteModal = ref(false);
const tugasIdToDelete = ref(null);

// Lifecycle hook: Ambil daftar tugas saat komponen dimuat
onMounted(async () => {
  if (currentUserId.value) {
    await tugasStore.fetchTugas(currentUserId.value);
  } else {
    console.error('User ID not available for fetching tasks. Please log in.');
  }
});

// --- Fungsi untuk Form Tambah/Edit ---
const openForm = (tugas = null) => {
  if (tugas) {
    isEditMode.value = true;
    currentTugas.value = { ...tugas };
  } else {
    isEditMode.value = false;
    currentTugas.value = {
      id: undefined,
      judul: '',
      deskripsi: '',
      tenggatWaktu: '',
      completed: false,
      fileLampiran: '',
      userId: currentUserId.value, // Set userId untuk tugas baru
    };
  }
  formErrors.value = {};
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  isEditMode.value = false;
  formErrors.value = {};
  currentTugas.value = {
    id: undefined,
    judul: '',
    deskripsi: '',
    tenggatWaktu: '',
    completed: false,
    fileLampiran: '',
    userId: undefined,
  };
};

const validateForm = () => {
  formErrors.value = {};
  if (!currentTugas.value.judul) formErrors.value.judul = 'Judul tugas wajib diisi.';
  if (!currentTugas.value.tenggatWaktu) formErrors.value.tenggatWaktu = 'Tenggat waktu wajib diisi.';

  return Object.keys(formErrors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  if (!currentUserId.value) {
    console.error('User ID not available. Cannot save task.');
    formErrors.value.general = 'Terjadi kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
    return;
  }

  let success = false;
  let activityDescription = '';

  if (isEditMode.value) {
    if (!currentTugas.value.id) {
      formErrors.value.general = 'Kesalahan: ID tugas tidak ditemukan untuk pembaruan.';
      return;
    }
    success = await tugasStore.updateTugas(currentTugas.value.id, currentTugas.value, currentUserId.value);
    activityDescription = `Tugas "${currentTugas.value.judul}" (ID: ${currentTugas.value.id}) diperbarui`;
  } else {
    success = await tugasStore.addTugas(currentTugas.value, currentUserId.value);
    activityDescription = `Tugas baru "${currentTugas.value.judul}" ditambahkan`;
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

/**
 * Memperbarui status 'completed' tugas langsung dari checkbox di tabel.
 * @param {object} tugasItem - Objek tugas yang statusnya diubah.
 */
const updateTugasCompletion = async (tugasItem) => {
  if (!currentUserId.value) {
    console.error('User ID not available. Cannot update task completion.');
    return;
  }
  // Panggil aksi updateTugas dengan ID dan seluruh objek tugas yang sudah diperbarui
  const success = await tugasStore.updateTugas(tugasItem.id, tugasItem, currentUserId.value);
  if (success) {
    const statusText = tugasItem.completed ? 'diselesaikan' : 'ditandai belum selesai';
    dashboardStore.addActivity({
      date: new Date().toLocaleDateString('id-ID'),
      description: `Tugas "${tugasItem.judul}" ${statusText}`,
      user: authStore.user?.name || 'Admin'
    });
    console.log(`Tugas "${tugasItem.judul}" berhasil ${statusText}.`);
  } else {
    // Jika update gagal, kembalikan status checkbox di UI
    tugasItem.completed = !tugasItem.completed;
    console.error(`Gagal memperbarui status tugas "${tugasItem.judul}".`);
  }
};

// --- Fungsi untuk Hapus Tugas ---
const confirmDelete = (id) => {
  tugasIdToDelete.value = id;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  tugasIdToDelete.value = null;
};

const executeDelete = async () => {
  if (tugasIdToDelete.value && currentUserId.value) {
    const success = await tugasStore.deleteTugas(tugasIdToDelete.value, currentUserId.value);
    if (success) {
      dashboardStore.addActivity({
        date: new Date().toLocaleDateString('id-ID'),
        description: `Tugas dengan ID ${tugasIdToDelete.value} dihapus`,
        user: authStore.user?.name || 'Admin'
      });
      console.log(`Tugas dengan ID ${tugasIdToDelete.value} berhasil dihapus.`);
    }
    cancelDelete();
  } else {
    console.error('User ID atau Tugas ID tidak tersedia untuk penghapusan.');
  }
};
</script>

<style scoped>
.tugas-page {
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

.tugas-form-section {
  margin-bottom: 2rem; /* Jarak antara form dan tabel */
  padding: 1.5rem;
}

.tugas-form-section h3 {
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

/* Gaya untuk daftar tugas (menggunakan kelas .card global) */
.tugas-list {
  overflow-x: auto; /* Memungkinkan scroll horizontal untuk tabel di layar kecil */
}

/* Gaya untuk tabel data */
.data-table {
  width: 100%;
  border-collapse: collapse; /* Menghilangkan spasi antar border sel */
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #eee; /* Garis pemisah antar baris */
}

.data-table th {
  background-color: #f8f9fa; /* Latar belakang untuk header tabel */
  color: #777;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.data-table tbody tr:last-child td {
  border-bottom: none; /* Hapus border bawah untuk baris terakhir */
}

/* Gaya untuk kolom aksi (Edit, Hapus) */
.data-table .actions {
  display: flex;
  gap: 0.5rem; /* Spasi antar tombol aksi */
}

/* Gaya untuk pesan jika tidak ada data */
.no-data-message {
  padding: 2rem;
  text-align: center;
  color: #777;
}

/* Gaya untuk Modal Konfirmasi */
.modal-overlay {
  position: fixed; /* Tetap di posisi yang sama saat scroll */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Overlay gelap transparan */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Pastikan modal di atas elemen lain */
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px; /* Lebar maksimum modal */
  width: 90%; /* Lebar responsif */
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
  gap: 1rem; /* Spasi antar tombol di modal */
}

/* Gaya khusus untuk label checkbox di form */
.form-group .inline-label {
  display: inline-block;
  margin-left: 0.5rem;
  font-weight: normal;
  color: #333;
}

/* Gaya untuk checkbox di tabel */
.data-table input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid #ccc;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  vertical-align: middle;
}

.data-table input[type="checkbox"]:checked {
  background-color: #6a6ee0;
  border-color: #6a6ee0;
}

.data-table input[type="checkbox"]:checked::after {
  content: '✔';
  color: white;
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
