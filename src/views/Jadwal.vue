<template>
    <div class="jadwal-page">
      <div class="header-actions">
        <h2>Manajemen Jadwal Kuliah</h2>
        <!-- Tombol untuk menampilkan form tambah jadwal -->
        <button @click="openForm()" class="btn btn-primary">Tambah Jadwal</button>
      </div>
  
      <!-- Form Tambah/Edit Jadwal (akan muncul di halaman yang sama) -->
      <div v-if="showForm" class="jadwal-form-section card">
        <h3>{{ isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal Baru' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="mataKuliah">Mata Kuliah:</label>
            <input type="text" id="mataKuliah" v-model="currentJadwal.mataKuliah" required />
            <p v-if="formErrors.mataKuliah" class="error-message">{{ formErrors.mataKuliah }}</p>
          </div>
          <div class="form-group">
            <label for="hari">Hari:</label>
            <select id="hari" v-model="currentJadwal.hari" required>
              <option value="">Pilih Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
            </select>
            <p v-if="formErrors.hari" class="error-message">{{ formErrors.hari }}</p>
          </div>
          <div class="form-group">
            <label for="waktuMulai">Waktu Mulai:</label>
            <input type="time" id="waktuMulai" v-model="currentJadwal.waktuMulai" required />
            <p v-if="formErrors.waktuMulai" class="error-message">{{ formErrors.waktuMulai }}</p>
          </div>
          <div class="form-group">
            <label for="waktuSelesai">Waktu Selesai:</label>
            <input type="time" id="waktuSelesai" v-model="currentJadwal.waktuSelesai" required />
            <p v-if="formErrors.waktuSelesai" class="error-message">{{ formErrors.waktuSelesai }}</p>
          </div>
          <div class="form-group">
            <label for="ruangan">Ruangan:</label>
            <input type="text" id="ruangan" v-model="currentJadwal.ruangan" required />
            <p v-if="formErrors.ruangan" class="error-message">{{ formErrors.ruangan }}</p>
          </div>
          <div class="form-group">
            <label for="dosen">Dosen Pengampu:</label>
            <input type="text" id="dosen" v-model="currentJadwal.dosen" required />
            <p v-if="formErrors.dosen" class="error-message">{{ formErrors.dosen }}</p>
          </div>
  
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="jadwalStore.isLoading">
              {{ isEditMode ? 'Update Jadwal' : 'Simpan Jadwal' }}
              <span v-if="jadwalStore.isLoading" class="loading-spinner"></span>
            </button>
            <button type="button" @click="closeForm" class="btn btn-secondary">Batal</button>
          </div>
          <p v-if="jadwalStore.error" class="error-message">{{ jadwalStore.error }}</p>
        </form>
      </div>
  
      <!-- Menampilkan status loading saat data sedang diambil -->
      <p v-if="jadwalStore.isLoading && !showForm">Memuat jadwal...</p>
      <!-- Menampilkan pesan error jika ada masalah saat mengambil data -->
      <p v-else-if="jadwalStore.error && !showForm" class="error-message">{{ jadwalStore.error }}</p>
      <!-- Menampilkan pesan jika tidak ada jadwal yang ditemukan dan form tidak aktif -->
      <div v-else-if="jadwalStore.jadwalList.length === 0 && !showForm" class="no-data-message card">
        <p>Belum ada jadwal. Silakan tambahkan jadwal baru.</p>
      </div>
      <!-- Menampilkan daftar jadwal dalam tabel jika ada data dan form tidak aktif -->
      <div v-else class="jadwal-list card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mata Kuliah</th>
              <th>Hari</th>
              <th>Waktu</th>
              <th>Ruangan</th>
              <th>Dosen</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="jadwal in jadwalStore.jadwalList" :key="jadwal.id">
              <td>{{ jadwal.id }}</td>
              <td>{{ jadwal.mataKuliah }}</td>
              <td>{{ jadwal.hari }}</td>
              <td>{{ jadwal.waktuMulai }} - {{ jadwal.waktuSelesai }}</td>
              <td>{{ jadwal.ruangan }}</td>
              <td>{{ jadwal.dosen }}</td>
              <td class="actions">
                <button @click="openForm(jadwal)" class="btn btn-secondary btn-small">Edit</button>
                <button @click="confirmDelete(jadwal.id)" class="btn btn-danger btn-small">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal Konfirmasi Hapus -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content card">
          <h3>Konfirmasi Hapus Jadwal</h3>
          <p>Apakah Anda yakin ingin menghapus jadwal ini?</p>
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
  import { useJadwalStore } from '@/stores/jadwal';
  import { useDashboardStore } from '@/stores/dashboard';
  import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi
  
  const jadwalStore = useJadwalStore();
  const dashboardStore = useDashboardStore();
  const authStore = useAuthStore(); // Inisialisasi authStore
  
  // Dapatkan userId dari authStore
  const currentUserId = computed(() => authStore.user?.id);
  
  // --- State untuk Form Tambah/Edit ---
  const showForm = ref(false);
  const isEditMode = ref(false);
  const currentJadwal = ref({
    id: undefined,
    mataKuliah: '',
    hari: '',
    waktuMulai: '',
    waktuSelesai: '',
    ruangan: '',
    dosen: '',
    userId: undefined, // Tambahkan properti userId
  });
  const formErrors = ref({});
  
  // --- State untuk Modal Konfirmasi Hapus ---
  const showDeleteModal = ref(false);
  const jadwalIdToDelete = ref(null);
  
  // Lifecycle hook: Ambil daftar jadwal saat komponen dimuat
  onMounted(() => {
    // Pastikan userId tersedia sebelum memanggil fetchJadwal
    if (currentUserId.value) {
      jadwalStore.fetchJadwal(currentUserId.value);
    } else {
      // Handle case where userId is not available (e.g., not logged in)
      console.error('User ID not available for fetching schedules. Please log in.');
      // Anda bisa mengarahkan pengguna ke halaman login atau menampilkan pesan error di UI
    }
  });
  
  // --- Fungsi untuk Form Tambah/Edit ---
  const openForm = (jadwal = null) => {
    if (jadwal) {
      isEditMode.value = true;
      currentJadwal.value = { ...jadwal };
    } else {
      isEditMode.value = false;
      currentJadwal.value = {
        id: undefined,
        mataKuliah: '',
        hari: '',
        waktuMulai: '',
        waktuSelesai: '',
        ruangan: '',
        dosen: '',
        userId: currentUserId.value, // Set userId untuk jadwal baru
      };
    }
    formErrors.value = {};
    showForm.value = true;
  };
  
  const closeForm = () => {
    showForm.value = false;
    isEditMode.value = false;
    formErrors.value = {};
    currentJadwal.value = {
      id: undefined,
      mataKuliah: '',
      hari: '',
      waktuMulai: '',
      waktuSelesai: '',
      ruangan: '',
      dosen: '',
      userId: undefined,
    };
  };
  
  const validateForm = () => {
    formErrors.value = {};
    if (!currentJadwal.value.mataKuliah) formErrors.value.mataKuliah = 'Mata Kuliah wajib diisi.';
    if (!currentJadwal.value.hari) formErrors.value.hari = 'Hari wajib diisi.';
    if (!currentJadwal.value.waktuMulai) formErrors.value.waktuMulai = 'Waktu mulai wajib diisi.';
    if (!currentJadwal.value.waktuSelesai) formErrors.value.waktuSelesai = 'Waktu selesai wajib diisi.';
    if (!currentJadwal.value.ruangan) formErrors.value.ruangan = 'Ruangan wajib diisi.';
    if (!currentJadwal.value.dosen) formErrors.value.dosen = 'Dosen pengampu wajib diisi.';
  
    if (currentJadwal.value.waktuMulai && currentJadwal.value.waktuSelesai &&
        currentJadwal.value.waktuSelesai < currentJadwal.value.waktuMulai) {
      formErrors.value.waktuSelesai = 'Waktu selesai tidak boleh sebelum waktu mulai.';
    }
  
    return Object.keys(formErrors.value).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    if (!currentUserId.value) {
      console.error('User ID not available. Cannot save schedule.');
      formErrors.value.general = 'Terjadi kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
      return;
    }
  
    let success = false;
    let activityDescription = '';
  
    if (isEditMode.value) {
      if (!currentJadwal.value.id) {
        formErrors.value.general = 'Kesalahan: ID jadwal tidak ditemukan untuk pembaruan.';
        return;
      }
      success = await jadwalStore.updateJadwal(currentJadwal.value.id, currentJadwal.value, currentUserId.value);
      activityDescription = `Jadwal Mata Kuliah "${currentJadwal.value.mataKuliah}" (ID: ${currentJadwal.value.id}) diperbarui`;
    } else {
      // Pastikan userId disertakan saat menambah jadwal baru
      success = await jadwalStore.addJadwal(currentJadwal.value, currentUserId.value);
      activityDescription = `Jadwal baru Mata Kuliah "${currentJadwal.value.mataKuliah}" ditambahkan`;
    }
  
    if (success) {
      dashboardStore.addActivity({
        date: new Date().toLocaleDateString('id-ID'),
        description: activityDescription,
        user: authStore.user?.name || 'Admin' // Gunakan nama user yang login
      });
      closeForm();
    }
  };
  
  // --- Fungsi untuk Hapus Jadwal ---
  const confirmDelete = (id) => {
    jadwalIdToDelete.value = id;
    showDeleteModal.value = true;
  };
  
  const cancelDelete = () => {
    showDeleteModal.value = false;
    jadwalIdToDelete.value = null;
  };
  
  const executeDelete = async () => {
    if (jadwalIdToDelete.value && currentUserId.value) {
      const success = await jadwalStore.deleteJadwal(jadwalIdToDelete.value, currentUserId.value);
      if (success) {
        dashboardStore.addActivity({
          date: new Date().toLocaleDateString('id-ID'),
          description: `Jadwal dengan ID ${jadwalIdToDelete.value} dihapus`,
          user: authStore.user?.name || 'Admin'
        });
        console.log(`Jadwal dengan ID ${jadwalIdToDelete.value} berhasil dihapus.`);
      }
      cancelDelete();
    } else {
      console.error('User ID atau Jadwal ID tidak tersedia untuk penghapusan.');
    }
  };
  </script>
  
  <style scoped>
  .jadwal-page {
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
  
  .jadwal-form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .jadwal-form-section h3 {
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
  
  .jadwal-list {
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
  