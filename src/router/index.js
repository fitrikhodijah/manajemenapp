import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/login.vue'
import NotFound from '@/views/NotFound.vue'
import MataKuliahForm from '@/views/MataKuliahForm.vue'
import MataKuliah from '@/views/MataKuliah.vue'
import Register from '@/views/Register.vue'
import Jadwal from '@/views/Jadwal.vue'
import Tugas from '@/views/Tugas.vue'
import Catatan from '@/views/Catatan.vue'
import Nilai from '@/views/Nilai.vue'
import Keuangan from '@/views/Keuangan.vue'
import Profil from '@/views/Profil.vue'


const routes = [
  {
    path: '/',
    children: [
      { path: '', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
      { path: 'mata-kuliah', name: 'MataKuliah', component: MataKuliah, meta: { requiresAuth: true } },
      { path: 'mata-kuliah/add', name: 'AddMataKuliah', component: MataKuliahForm, meta: { requiresAuth: true } },
      { path: 'mata-kuliah/edit/:id', name: 'EditMataKuliah', component: MataKuliahForm, props: true, meta: { requiresAuth: true } },
      { path: 'jadwal', name: 'Jadwal', component: Jadwal, meta: { requiresAuth: true } },
      { path: 'tugas', name: 'Tugas', component: Tugas, meta: { requiresAuth: true } },
      { path: 'catatan', name: 'Catatan', component: Catatan, meta: { requiresAuth: true } },
      { path: 'nilai', name: 'Nilai', component: Nilai, meta: { requiresAuth: true } },
      { path: 'keuangan', name: 'Keuangan', component: Keuangan, meta: { requiresAuth: true } },
      { path: 'profil', name: 'Profil', component: Profil, meta: { requiresAuth: true } },
    ]
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  // authStore.initAuthListener(); // HAPUS BARIS INI - Sudah dipanggil di main.js

  // Pastikan authInitialized sudah true sebelum memeriksa status autentikasi
  // Ini mencegah masalah timing di mana listener belum siap
  if (!authStore.authInitialized) {
    // Jika belum diinisialisasi, tunggu sebentar atau redirect ke login
    // Untuk tujuan ini, kita asumsikan initAuthListener di main.js akan cepat
    // dan onAuthStateChanged akan segera memperbarui isAuthenticated
    // Jika ini masih masalah, Anda mungkin perlu menambahkan loading screen
    // atau state 'isAuthReady' di authStore.
    console.warn('Auth store not yet initialized in router guard. This might indicate a timing issue.');
    // next(false); // Atau next('/loading') jika ada loading page
    // Untuk sekarang, biarkan alur di bawah berjalan
  }


  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router
