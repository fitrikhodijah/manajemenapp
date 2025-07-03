<template>
    <div class="catatan-page">
      <div class="header-actions">
        <h2>Catatan / Note Organizer</h2>
        <!-- Input untuk pencarian catatan -->
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari catatan..."
          class="search-input"
        />
        <button @click="openForm()" class="btn btn-primary">Tambah Catatan</button>
      </div>
  
      <!-- Form Tambah/Edit Catatan (akan muncul di halaman yang sama) -->
      <div v-if="showForm" class="catatan-form-section card">
        <h3>{{ isEditMode ? 'Edit Catatan' : 'Tambah Catatan Baru' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="judul">Judul Catatan:</label>
            <input type="text" id="judul" v-model="currentCatatan.judul" required />
            <p v-if="formErrors.judul" class="error-message">{{ formErrors.judul }}</p>
          </div>
          <div class="form-group">
            <label for="deskripsi">Isi Catatan:</label>
            <textarea id="deskripsi" v-model="currentCatatan.deskripsi" rows="5"></textarea>
          </div>
          <div class="form-group">
            <label for="mataKuliah">Mata Kuliah Terkait:</label>
            <input type="text" id="mataKuliah" v-model="currentCatatan.mataKuliah" />
          </div>
          <div class="form-group">
            <label for="kategori">Kategori:</label>
            <input type="text" id="kategori" v-model="currentCatatan.kategori" />
          </div>
          <div class="form-group">
            <label for="tanggal">Tanggal:</label>
            <input type="date" id="tanggal" v-model="currentCatatan.tanggal" required />
            <p v-if="formErrors.tanggal" class="error-message">{{ formErrors.tanggal }}</p>
          </div>
  
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="catatanStore.isLoading">
              {{ isEditMode ? 'Update Catatan' : 'Simpan Catatan' }}
              <span v-if="catatanStore.isLoading" class="loading-spinner"></span>
            </button>
            <button type="button" @click="closeForm" class="btn btn-secondary">Batal</button>
          </div>
          <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
          <p v-if="catatanStore.error" class="error-message">{{ catatanStore.error }}</p>
        </form>
      </div>
  
      <!-- Menampilkan status loading saat data sedang diambil -->
      <p v-if="catatanStore.isLoading && !showForm">Memuat catatan...</p>
      <!-- Menampilkan pesan error jika ada masalah saat mengambil data -->
      <p v-else-if="catatanStore.error && !showForm" class="error-message">{{ catatanStore.error }}</p>
      <!-- Menampilkan pesan jika tidak ada catatan yang ditemukan dan form tidak aktif -->
      <div v-else-if="filteredCatatanList.length === 0 && !showForm" class="no-data-message card">
        <p>Tidak ada catatan yang ditemukan. Silakan tambahkan catatan baru atau sesuaikan pencarian Anda.</p>
      </div>
      <!-- Menampilkan daftar catatan dalam tabel jika ada data dan form tidak aktif -->
      <div v-else class="catatan-list card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Judul</th>
              <th>Mata Kuliah</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Lihat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="catatan in filteredCatatanList" :key="catatan.id">
              <td>{{ catatan.id }}</td>
              <td>{{ catatan.judul }}</td>
              <td>{{ catatan.mataKuliah }}</td>
              <td>{{ catatan.kategori }}</td>
              <td>{{ catatan.tanggal }}</td>
              <td>
                <button @click="openViewModal(catatan)" class="btn btn-secondary btn-small">Lihat</button>
              </td>
              <td class="actions">
                <button @click="openForm(catatan)" class="btn btn-secondary btn-small">Edit</button>
                <button @click="confirmDelete(catatan.id)" class="btn btn-danger btn-small">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal Konfirmasi Hapus -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content card">
          <h3>Konfirmasi Hapus Catatan</h3>
          <p>Apakah Anda yakin ingin menghapus catatan ini?</p>
          <div class="modal-actions">
            <button @click="cancelDelete" class="btn btn-secondary">Batal</button>
            <button @click="executeDelete" class="btn btn-danger">Hapus</button>
          </div>
        </div>
      </div>
  
      <!-- Modal Lihat Catatan -->
      <div v-if="showViewModal" class="modal-overlay">
        <div class="modal-content card">
          <h3>Detail Catatan: {{ currentViewCatatan.judul }}</h3>
          <div class="note-details">
            <p><strong>Mata Kuliah:</strong> {{ currentViewCatatan.mataKuliah }}</p>
            <p><strong>Kategori:</strong> {{ currentViewCatatan.kategori }}</p>
            <p><strong>Tanggal:</strong> {{ currentViewCatatan.tanggal }}</p>
            <p><strong>Isi Catatan:</strong></p>
            <div class="note-description-content">{{ currentViewCatatan.deskripsi }}</div>
          </div>
          <div class="modal-actions">
            <button @click="closeViewModal" class="btn btn-primary">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  
  import { ref, onMounted, computed } from 'vue';
  import { useCatatanStore } from '@/stores/catatan';
  import { useDashboardStore } from '@/stores/dashboard';
  import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi
  
  const catatanStore = useCatatanStore();
  const dashboardStore = useDashboardStore();
  const authStore = useAuthStore(); // Inisialisasi authStore
  
  // Dapatkan userId dari authStore
  const currentUserId = computed(() => authStore.user?.id);
  
  // --- State untuk Form Tambah/Edit ---
  const showForm = ref(false);
  const isEditMode = ref(false);
  const currentCatatan = ref({
    id: undefined,
    judul: '',
    deskripsi: '',
    mataKuliah: '',
    kategori: '',
    tanggal: '',
    userId: undefined, // Tambahkan properti userId
  });
  const formErrors = ref({});
  
  // --- State untuk Modal Konfirmasi Hapus ---
  const showDeleteModal = ref(false);
  const catatanIdToDelete = ref(null);
  
  // --- State untuk Modal Lihat Catatan ---
  const showViewModal = ref(false);
  const currentViewCatatan = ref({}); // Untuk menyimpan data catatan yang akan dilihat
  
  // --- State untuk Pencarian ---
  const searchQuery = ref('');
  
  // Computed property untuk memfilter catatan berdasarkan query pencarian
  const filteredCatatanList = computed(() => {
    if (!searchQuery.value) {
      return catatanStore.catatanList;
    }
    const query = searchQuery.value.toLowerCase();
    return catatanStore.catatanList.filter(catatan =>
      catatan.judul.toLowerCase().includes(query) ||
      catatan.deskripsi.toLowerCase().includes(query) ||
      catatan.mataKuliah.toLowerCase().includes(query) ||
      catatan.kategori.toLowerCase().includes(query)
    );
  });
  
  // Lifecycle hook: Ambil daftar catatan saat komponen dimuat
  onMounted(() => {
    if (currentUserId.value) {
      catatanStore.fetchCatatan(currentUserId.value);
    } else {
      console.error('User ID not available for fetching notes. Please log in.');
    }
  });
  
  // --- Fungsi untuk Form Tambah/Edit ---
  const openForm = (catatan = null) => {
    if (catatan) {
      isEditMode.value = true;
      currentCatatan.value = { ...catatan };
    } else {
      isEditMode.value = false;
      currentCatatan.value = {
        id: undefined,
        judul: '',
        deskripsi: '',
        mataKuliah: '',
        kategori: '',
        tanggal: new Date().toISOString().slice(0, 10), // Tanggal default hari ini
        userId: currentUserId.value, // Set userId untuk catatan baru
      };
    }
    formErrors.value = {};
    showForm.value = true;
  };
  
  const closeForm = () => {
    showForm.value = false;
    isEditMode.value = false;
    formErrors.value = {};
    currentCatatan.value = {
      id: undefined,
      judul: '',
      deskripsi: '',
      mataKuliah: '',
      kategori: '',
      tanggal: '',
      userId: undefined,
    };
  };
  
  const validateForm = () => {
    formErrors.value = {};
    if (!currentCatatan.value.judul) formErrors.value.judul = 'Judul catatan wajib diisi.';
    if (!currentCatatan.value.tanggal) formErrors.value.tanggal = 'Tanggal wajib diisi.';
  
    return Object.keys(formErrors.value).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    if (!currentUserId.value) {
      console.error('User ID not available. Cannot save note.');
      formErrors.value.general = 'Terjadi kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
      return;
    }
  
    let success = false;
    let activityDescription = '';
  
    if (isEditMode.value) {
      if (!currentCatatan.value.id) {
        formErrors.value.general = 'Kesalahan: ID catatan tidak ditemukan untuk pembaruan.';
        return;
      }
      success = await catatanStore.updateCatatan(currentCatatan.value.id, currentCatatan.value, currentUserId.value);
      activityDescription = `Catatan "${currentCatatan.value.judul}" (ID: ${currentCatatan.value.id}) diperbarui`;
    } else {
      success = await catatanStore.addCatatan(currentCatatan.value, currentUserId.value);
      activityDescription = `Catatan baru "${currentCatatan.value.judul}" ditambahkan`;
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
  
  // --- Fungsi untuk Hapus Catatan ---
  const confirmDelete = (id) => {
    catatanIdToDelete.value = id;
    showDeleteModal.value = true;
  };
  
  const cancelDelete = () => {
    showDeleteModal.value = false;
    catatanIdToDelete.value = null;
  };
  
  const executeDelete = async () => {
    if (catatanIdToDelete.value && currentUserId.value) {
      const success = await catatanStore.deleteCatatan(catatanIdToDelete.value, currentUserId.value);
      if (success) {
        dashboardStore.addActivity({
          date: new Date().toLocaleDateString('id-ID'),
          description: `Catatan dengan ID ${catatanIdToDelete.value} dihapus`,
          user: authStore.user?.name || 'Admin'
        });
        console.log(`Catatan dengan ID ${catatanIdToDelete.value} berhasil dihapus.`);
      }
      cancelDelete();
    } else {
      console.error('User ID atau Catatan ID tidak tersedia untuk penghapusan.');
    }
  };
  
  // --- Fungsi untuk Melihat Catatan ---
  const openViewModal = (catatan) => {
    currentViewCatatan.value = { ...catatan };
    showViewModal.value = true;
  };
  
  const closeViewModal = () => {
    showViewModal.value = false;
    currentViewCatatan.value = {};
  };
  </script>
  
  <style scoped>
  .catatan-page {
    width: 100%;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .header-actions h2 {
    margin: 0;
    color: #333;
    flex-shrink: 0;
  }
  
  .search-input {
    flex-grow: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
    max-width: 300px;
  }
  
  .btn-primary, .btn-secondary {
    flex-shrink: 0;
  }
  
  .catatan-form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .catatan-form-section h3 {
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
  
  .catatan-list {
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
  
  .note-details {
    text-align: left;
    margin-top: 1rem;
  }
  
  .note-details p {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .note-details strong {
    color: #6a6ee0;
  }
  
  .note-description-content {
    background-color: #f8f9fa;
    border: 1px solid #eee;
    padding: 1rem;
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    text-align: left;
    color: #444;
  }
  </style>
  