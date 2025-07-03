<template>
    <div class="nilai-page">
      <div class="header-actions">
        <h2>Nilai & IPK Tracker</h2>
        <!-- Tombol untuk menampilkan form tambah nilai -->
        <button @click="openForm()" class="btn btn-primary">Tambah Nilai</button>
      </div>
  
      <!-- Ringkasan IPK -->
      <div class="ipk-summary card">
        <h3>Indeks Prestasi Kumulatif (IPK)</h3>
        <p class="ipk-value">{{ calculatedIPK.toFixed(2) }}</p>
        <p class="sks-total">Total SKS: {{ totalSKS }}</p>
      </div>
  
      <!-- Grafik Perkembangan Nilai (Dihilangkan dari template) -->
  
      <!-- Form Tambah/Edit Nilai (akan muncul di halaman yang sama) -->
      <div v-if="showForm" class="nilai-form-section card">
        <h3>{{ isEditMode ? 'Edit Nilai' : 'Tambah Nilai Baru' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="namaMataKuliah">Nama Mata Kuliah:</label>
            <input type="text" id="namaMataKuliah" v-model="currentNilai.namaMataKuliah" required />
            <p v-if="formErrors.namaMataKuliah" class="error-message">{{ formErrors.namaMataKuliah }}</p>
          </div>
          <div class="form-group">
            <label for="semester">Semester:</label>
            <input type="text" id="semester" v-model="currentNilai.semester" required />
            <p v-if="formErrors.semester" class="error-message">{{ formErrors.semester }}</p>
          </div>
          <div class="form-group">
            <label for="sks">SKS:</label>
            <input type="number" id="sks" v-model="currentNilai.sks" required min="1" />
            <p v-if="formErrors.sks" class="error-message">{{ formErrors.sks }}</p>
          </div>
          <div class="form-group">
            <label for="nilaiHuruf">Nilai Huruf:</label>
            <select id="nilaiHuruf" v-model="currentNilai.nilaiHuruf" required>
              <option value="">Pilih Nilai</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
            <p v-if="formErrors.nilaiHuruf" class="error-message">{{ formErrors.nilaiHuruf }}</p>
          </div>
  
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="nilaiStore.isLoading">
              {{ isEditMode ? 'Update Nilai' : 'Simpan Nilai' }}
              <span v-if="nilaiStore.isLoading" class="loading-spinner"></span>
            </button>
            <button type="button" @click="closeForm" class="btn btn-secondary">Batal</button>
          </div>
          <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
          <p v-if="nilaiStore.error" class="error-message">{{ nilaiStore.error }}</p>
        </form>
      </div>
  
      <!-- Menampilkan status loading saat data sedang diambil -->
      <p v-if="nilaiStore.isLoading && !showForm">Memuat nilai...</p>
      <!-- Menampilkan pesan error jika ada masalah saat mengambil data -->
      <p v-else-if="nilaiStore.error && !showForm" class="error-message">{{ nilaiStore.error }}</p>
      <!-- Menampilkan pesan jika tidak ada nilai yang ditemukan dan form tidak aktif -->
      <div v-else-if="nilaiStore.nilaiList.length === 0 && !showForm" class="no-data-message card">
        <p>Belum ada nilai. Silakan tambahkan nilai baru.</p>
      </div>
      <!-- Menampilkan daftar nilai dalam tabel jika ada data dan form tidak aktif -->
      <div v-else class="nilai-list card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mata Kuliah</th>
              <th>Semester</th>
              <th>SKS</th>
              <th>Nilai Huruf</th>
              <th>Nilai Angka</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nilai in nilaiStore.nilaiList" :key="nilai.id">
              <td>{{ nilai.id }}</td>
              <td>{{ nilai.namaMataKuliah }}</td>
              <td>{{ nilai.semester }}</td>
              <td>{{ nilai.sks }}</td>
              <td>{{ nilai.nilaiHuruf }}</td>
              <td>{{ getNilaiAngka(nilai.nilaiHuruf).toFixed(2) }}</td>
              <td class="actions">
                <button @click="openForm(nilai)" class="btn btn-secondary btn-small">Edit</button>
                <button @click="confirmDelete(nilai.id)" class="btn btn-danger btn-small">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal Konfirmasi Hapus -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content card">
          <h3>Konfirmasi Hapus Nilai</h3>
          <p>Apakah Anda yakin ingin menghapus nilai ini?</p>
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
  import { useNilaiStore } from '@/stores/nilai'; // Impor Pinia store nilai
  import { useDashboardStore } from '@/stores/dashboard'; // Untuk menambahkan aktivitas
  import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi
  
  const nilaiStore = useNilaiStore();
  const dashboardStore = useDashboardStore();
  const authStore = useAuthStore(); // Inisialisasi authStore
  
  // Dapatkan userId dari authStore
  const currentUserId = computed(() => authStore.user?.id);
  
  // --- State untuk Form Tambah/Edit ---
  const showForm = ref(false);
  const isEditMode = ref(false);
  const currentNilai = ref({
    id: undefined, // Menggunakan undefined agar json-server mengenerate ID
    mataKuliahId: '', // ID mata kuliah terkait (opsional, bisa diisi otomatis atau manual)
    namaMataKuliah: '',
    semester: '',
    sks: null,
    nilaiHuruf: '',
    nilaiAngka: null, // Akan dihitung otomatis
    userId: undefined, // Tambahkan properti userId
  });
  const formErrors = ref({});
  
  // --- State untuk Modal Konfirmasi Hapus ---
  const showDeleteModal = ref(false);
  const nilaiIdToDelete = ref(null);
  
  // --- Computed untuk IPK ---
  const getNilaiAngka = (nilaiHuruf) => {
    switch (nilaiHuruf) {
      case 'A': return 4.0;
      case 'A-': return 3.7;
      case 'B+': return 3.5;
      case 'B': return 3.0;
      case 'B-': return 2.7;
      case 'C+': return 2.5;
      case 'C': return 2.0;
      case 'D': return 1.0;
      case 'E': return 0.0;
      default: return 0.0;
    }
  };
  
  const calculatedIPK = computed(() => {
    let totalBobotNilai = 0;
    let totalSKS = 0;
  
    nilaiStore.nilaiList.forEach(nilai => {
      const sks = parseFloat(nilai.sks);
      const nilaiAngka = getNilaiAngka(nilai.nilaiHuruf);
      if (!isNaN(sks) && !isNaN(nilaiAngka)) {
        totalBobotNilai += (nilaiAngka * sks);
        totalSKS += sks;
      }
    });
  
    if (totalSKS === 0) return 0;
    return totalBobotNilai / totalSKS;
  });
  
  const totalSKS = computed(() => {
    let sumSKS = 0;
    nilaiStore.nilaiList.forEach(nilai => {
      const sks = parseFloat(nilai.sks);
      if (!isNaN(sks)) {
        sumSKS += sks;
      }
    });
    return sumSKS;
  });
  
  // Lifecycle hook: Ambil daftar nilai saat komponen dimuat
  onMounted(() => {
    if (currentUserId.value) {
      nilaiStore.fetchNilai(currentUserId.value);
    } else {
      console.error('User ID not available for fetching grades. Please log in.');
    }
  });
  
  // --- Fungsi untuk Form Tambah/Edit ---
  const openForm = (nilai = null) => {
    if (nilai) {
      isEditMode.value = true;
      currentNilai.value = { ...nilai };
    } else {
      isEditMode.value = false;
      currentNilai.value = {
        id: undefined,
        mataKuliahId: '',
        namaMataKuliah: '',
        semester: '',
        sks: null,
        nilaiHuruf: '',
        nilaiAngka: null,
        userId: currentUserId.value, // Set userId untuk nilai baru
      };
    }
    formErrors.value = {};
    showForm.value = true;
  };
  
  const closeForm = () => {
    showForm.value = false;
    isEditMode.value = false;
    formErrors.value = {};
    currentNilai.value = {
      id: undefined,
      mataKuliahId: '',
      namaMataKuliah: '',
      semester: '',
      sks: null,
      nilaiHuruf: '',
      nilaiAngka: null,
      userId: undefined,
    };
  };
  
  const validateForm = () => {
    formErrors.value = {};
    if (!currentNilai.value.namaMataKuliah) formErrors.value.namaMataKuliah = 'Nama Mata Kuliah wajib diisi.';
    if (!currentNilai.value.semester) formErrors.value.semester = 'Semester wajib diisi.';
    if (!currentNilai.value.sks || currentNilai.value.sks <= 0) formErrors.value.sks = 'SKS wajib diisi dan harus lebih dari 0.';
    if (!currentNilai.value.nilaiHuruf) formErrors.value.nilaiHuruf = 'Nilai Huruf wajib diisi.';
  
    return Object.keys(formErrors.value).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    if (!currentUserId.value) {
      console.error('User ID not available. Cannot save grade.');
      formErrors.value.general = 'Terjadi kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
      return;
    }
  
    let success = false;
    let activityDescription = '';
  
    // Hitung nilaiAngka sebelum menyimpan
    currentNilai.value.nilaiAngka = getNilaiAngka(currentNilai.value.nilaiHuruf);
  
    if (isEditMode.value) {
      if (!currentNilai.value.id) {
        formErrors.value.general = 'Kesalahan: ID nilai tidak ditemukan untuk pembaruan.';
        return;
      }
      success = await nilaiStore.updateNilai(currentNilai.value.id, currentNilai.value, currentUserId.value);
      activityDescription = `Nilai Mata Kuliah "${currentNilai.value.namaMataKuliah}" (ID: ${currentNilai.value.id}) diperbarui`;
    } else {
      const nilaiToSave = { ...currentNilai.value };
      if (nilaiToSave.id === undefined || nilaiToSave.id === null) {
        delete nilaiToSave.id;
      }
      success = await nilaiStore.addNilai(nilaiToSave, currentUserId.value);
      activityDescription = `Nilai baru Mata Kuliah "${currentNilai.value.namaMataKuliah}" ditambahkan`;
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
  
  // --- Fungsi untuk Hapus Nilai ---
  const confirmDelete = (id) => {
    nilaiIdToDelete.value = id;
    showDeleteModal.value = true;
  };
  
  const cancelDelete = () => {
    showDeleteModal.value = false;
    nilaiIdToDelete.value = null;
  };
  
  const executeDelete = async () => {
    if (nilaiIdToDelete.value && currentUserId.value) {
      const success = await nilaiStore.deleteNilai(nilaiIdToDelete.value, currentUserId.value);
      if (success) {
        dashboardStore.addActivity({
          date: new Date().toLocaleDateString('id-ID'),
          description: `Nilai dengan ID ${nilaiIdToDelete.value} dihapus`,
          user: authStore.user?.name || 'Admin'
        });
        console.log(`Nilai dengan ID ${nilaiIdToDelete.value} berhasil dihapus.`);
      }
      cancelDelete();
    } else {
      console.error('User ID atau Nilai ID tidak tersedia untuk penghapusan.');
    }
  };
  </script>
  
  <style scoped>
  .nilai-page {
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
  
  /* Gaya untuk Ringkasan IPK */
  .ipk-summary {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .ipk-summary h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .ipk-value {
    font-size: 3rem;
    font-weight: bold;
    color: #6a6ee0; /* Warna utama */
    margin: 0.5rem 0;
  }
  
  .sks-total {
    font-size: 1rem;
    color: #777;
    margin-top: 0.5rem;
  }
  
  /* Gaya untuk Bagian Grafik (Dihilangkan dari HTML) */
  .chart-section {
    display: none; /* Menyembunyikan seluruh bagian grafik */
  }
  
  /* Gaya untuk bagian form */
  .nilai-form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .nilai-form-section h3 {
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
  
  /* Gaya untuk daftar nilai */
  .nilai-list {
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
  
  /* Modal Styling (sama dengan komponen lain) */
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
  