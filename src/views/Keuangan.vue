<template>
    <div class="keuangan-page">
      <div class="header-actions">
        <h2>Manajemen Keuangan Mahasiswa</h2>
        <button @click="openForm()" class="btn btn-primary">Tambah Transaksi</button>
      </div>
  
      <!-- Ringkasan Keuangan -->
      <div class="keuangan-summary card">
        <h3>Ringkasan Saldo</h3>
        <p class="total-pemasukan">Pemasukan: <span class="income">Rp{{ totalPemasukan.toLocaleString('id-ID') }}</span></p>
        <p class="total-pengeluaran">Pengeluaran: <span class="expense">Rp{{ totalPengeluaran.toLocaleString('id-ID') }}</span></p>
        <p class="saldo-akhir">Saldo Akhir: <span :class="{'income': saldoAkhir >= 0, 'expense': saldoAkhir < 0}">Rp{{ saldoAkhir.toLocaleString('id-ID') }}</span></p>
      </div>
  
      <!-- Form Tambah/Edit Transaksi (akan muncul di halaman yang sama) -->
      <div v-if="showForm" class="transaksi-form-section card">
        <h3>{{ isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi Baru' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="tanggal">Tanggal:</label>
            <input type="date" id="tanggal" v-model="currentTransaksi.tanggal" required />
            <p v-if="formErrors.tanggal" class="error-message">{{ formErrors.tanggal }}</p>
          </div>
          <div class="form-group">
            <label for="deskripsi">Deskripsi:</label>
            <input type="text" id="deskripsi" v-model="currentTransaksi.deskripsi" required />
            <p v-if="formErrors.deskripsi" class="error-message">{{ formErrors.deskripsi }}</p>
          </div>
          <div class="form-group">
            <label for="jumlah">Jumlah:</label>
            <input type="number" id="jumlah" v-model="currentTransaksi.jumlah" required min="0" />
            <p v-if="formErrors.jumlah" class="error-message">{{ formErrors.jumlah }}</p>
          </div>
          <div class="form-group">
            <label for="tipe">Tipe:</label>
            <select id="tipe" v-model="currentTransaksi.tipe" required>
              <option value="">Pilih Tipe</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran">Pengeluaran</option>
            </select>
            <p v-if="formErrors.tipe" class="error-message">{{ formErrors.tipe }}</p>
          </div>
          <div class="form-group">
            <label for="kategori">Kategori:</label>
            <input type="text" id="kategori" v-model="currentTransaksi.kategori" />
          </div>
  
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="keuanganStore.isLoading">
              {{ isEditMode ? 'Update Transaksi' : 'Simpan Transaksi' }}
              <span v-if="keuanganStore.isLoading" class="loading-spinner"></span>
            </button>
            <button type="button" @click="closeForm" class="btn btn-secondary">Batal</button>
          </div>
          <p v-if="formErrors.general" class="error-message">{{ formErrors.general }}</p>
          <p v-if="keuanganStore.error" class="error-message">{{ keuanganStore.error }}</p>
        </form>
      </div>
  
      <!-- Menampilkan status loading saat data sedang diambil -->
      <p v-if="keuanganStore.isLoading && !showForm">Memuat transaksi...</p>
      <!-- Menampilkan pesan error jika ada masalah saat mengambil data -->
      <p v-else-if="keuanganStore.error && !showForm" class="error-message">{{ keuanganStore.error }}</p>
      <!-- Menampilkan pesan jika tidak ada transaksi yang ditemukan dan form tidak aktif -->
      <div v-else-if="keuanganStore.transaksiList.length === 0 && !showForm" class="no-data-message card">
        <p>Belum ada transaksi. Silakan tambahkan transaksi baru.</p>
      </div>
      <!-- Menampilkan daftar transaksi dalam tabel jika ada data dan form tidak aktif -->
      <div v-else class="transaksi-list card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th>Tipe</th>
              <th>Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaksi in keuanganStore.transaksiList" :key="transaksi.id">
              <td>{{ transaksi.id }}</td>
              <td>{{ transaksi.tanggal }}</td>
              <td>{{ transaksi.deskripsi }}</td>
              <td :class="{'income': transaksi.tipe === 'Pemasukan', 'expense': transaksi.tipe === 'Pengeluaran'}">
                Rp{{ transaksi.jumlah.toLocaleString('id-ID') }}
              </td>
              <td>{{ transaksi.tipe }}</td>
              <td>{{ transaksi.kategori }}</td>
              <td class="actions">
                <button @click="openForm(transaksi)" class="btn btn-secondary btn-small">Edit</button>
                <button @click="confirmDelete(transaksi.id)" class="btn btn-danger btn-small">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal Konfirmasi Hapus -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content card">
          <h3>Konfirmasi Hapus Transaksi</h3>
          <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>
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
  import { useKeuanganStore } from '@/stores/keuangan';
  import { useDashboardStore } from '@/stores/dashboard';
  import { useAuthStore } from '@/stores/auth'; // Impor store autentikasi
  
  const keuanganStore = useKeuanganStore();
  const dashboardStore = useDashboardStore();
  const authStore = useAuthStore(); // Inisialisasi authStore
  
  // Dapatkan userId dari authStore
  const currentUserId = computed(() => authStore.user?.id);
  
  // --- State untuk Form Tambah/Edit ---
  const showForm = ref(false);
  const isEditMode = ref(false);
  const currentTransaksi = ref({
    id: undefined, // Menggunakan undefined agar json-server mengenerate ID
    tanggal: '',
    deskripsi: '',
    jumlah: null,
    tipe: '',
    kategori: '',
    userId: undefined, // Tambahkan properti userId
  });
  const formErrors = ref({});
  
  // --- State untuk Modal Konfirmasi Hapus ---
  const showDeleteModal = ref(false);
  const transaksiIdToDelete = ref(null);
  
  // --- Computed untuk Ringkasan Keuangan ---
  const totalPemasukan = computed(() => {
    return keuanganStore.transaksiList
      .filter(t => t.tipe === 'Pemasukan')
      .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
  });
  
  const totalPengeluaran = computed(() => {
    return keuanganStore.transaksiList
      .filter(t => t.tipe === 'Pengeluaran')
      .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
  });
  
  const saldoAkhir = computed(() => {
    return totalPemasukan.value - totalPengeluaran.value;
  });
  
  // Lifecycle hook: Ambil daftar transaksi saat komponen dimuat
  onMounted(() => {
    if (currentUserId.value) {
      keuanganStore.fetchTransaksi(currentUserId.value);
    } else {
      console.error('User ID not available for fetching transactions. Please log in.');
    }
  });
  
  // --- Fungsi untuk Form Tambah/Edit ---
  const openForm = (transaksi = null) => {
    if (transaksi) {
      isEditMode.value = true;
      currentTransaksi.value = { ...transaksi };
    } else {
      isEditMode.value = false;
      currentTransaksi.value = {
        id: undefined,
        tanggal: new Date().toISOString().slice(0, 10),
        deskripsi: '',
        jumlah: null,
        tipe: '',
        kategori: '',
        userId: currentUserId.value, // Set userId untuk transaksi baru
      };
    }
    formErrors.value = {};
    showForm.value = true;
  };
  
  const closeForm = () => {
    showForm.value = false;
    isEditMode.value = false;
    formErrors.value = {};
    currentTransaksi.value = {
      id: undefined,
      tanggal: '',
      deskripsi: '',
      jumlah: null,
      tipe: '',
      kategori: '',
      userId: undefined,
    };
  };
  
  const validateForm = () => {
    formErrors.value = {};
    if (!currentTransaksi.value.tanggal) formErrors.value.tanggal = 'Tanggal wajib diisi.';
    if (!currentTransaksi.value.deskripsi) formErrors.value.deskripsi = 'Deskripsi wajib diisi.';
    if (!currentTransaksi.value.jumlah || currentTransaksi.value.jumlah <= 0) formErrors.value.jumlah = 'Jumlah wajib diisi dan harus lebih dari 0.';
    if (!currentTransaksi.value.tipe) formErrors.value.tipe = 'Tipe wajib diisi.';
  
    return Object.keys(formErrors.value).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    if (!currentUserId.value) {
      console.error('User ID not available. Cannot save transaction.');
      formErrors.value.general = 'Terjadi kesalahan: ID pengguna tidak ditemukan. Mohon coba login ulang.';
      return;
    }
  
    let success = false;
    let activityDescription = '';
  
    if (isEditMode.value) {
      if (!currentTransaksi.value.id) {
        formErrors.value.general = 'Kesalahan: ID transaksi tidak ditemukan untuk pembaruan.';
        return;
      }
      success = await keuanganStore.updateTransaksi(currentTransaksi.value.id, currentTransaksi.value, currentUserId.value);
      activityDescription = `Transaksi "${currentTransaksi.value.deskripsi}" (ID: ${currentTransaksi.value.id}) diperbarui`;
    } else {
      success = await keuanganStore.addTransaksi(currentTransaksi.value, currentUserId.value);
      activityDescription = `Transaksi baru "${currentTransaksi.value.deskripsi}" ditambahkan`;
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
  
  // --- Fungsi untuk Hapus Transaksi ---
  const confirmDelete = (id) => {
    transaksiIdToDelete.value = id;
    showDeleteModal.value = true;
  };
  
  const cancelDelete = () => {
    showDeleteModal.value = false;
    transaksiIdToDelete.value = null;
  };
  
  const executeDelete = async () => {
    if (transaksiIdToDelete.value && currentUserId.value) {
      const success = await keuanganStore.deleteTransaksi(transaksiIdToDelete.value, currentUserId.value);
      if (success) {
        dashboardStore.addActivity({
          date: new Date().toLocaleDateString('id-ID'),
          description: `Transaksi dengan ID ${transaksiIdToDelete.value} dihapus`,
          user: authStore.user?.name || 'Admin'
        });
        console.log(`Transaksi dengan ID ${transaksiIdToDelete.value} berhasil dihapus.`);
      }
      cancelDelete();
    } else {
      console.error('User ID atau Transaksi ID tidak tersedia untuk penghapusan.');
    }
  };
  </script>
  
  <style scoped>
  .keuangan-page {
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
  
  .keuangan-summary {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .keuangan-summary h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .keuangan-summary p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
    color: #555;
  }
  
  .keuangan-summary .income {
    color: #28a745;
    font-weight: bold;
  }
  
  .keuangan-summary .expense {
    color: #dc3545;
    font-weight: bold;
  }
  
  .keuangan-summary .saldo-akhir {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
    color: #333;
  }
  
  .transaksi-form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .transaksi-form-section h3 {
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
  
  .transaksi-list {
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
