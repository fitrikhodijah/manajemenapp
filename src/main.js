import './assets/main.css'; // Impor gaya CSS global

import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Impor Pinia

import App from './App.vue';
import router from './router'; // Impor router

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Import getFirestore
import { getAuth } from 'firebase/auth';     // Import getAuth

// --- Firebase Configuration Anda ---
const firebaseConfig = {
  apiKey: "AIzaSyD2j7TBtZ9IMgi7_3mB1T0OZbswbVEx7KQ",
  authDomain: "manajemen-mahasiswa-app.firebaseapp.com",
  projectId: "manajemen-mahasiswa-app",
  storageBucket: "manajemen-mahasiswa-app.firebasestorage.app",
  messagingSenderId: "150057267551",
  appId: "1:150057267551:web:2d1915de06a9c723f586ea",
  measurementId: "G-8CETVE7FSL"
};

// --- Inisialisasi Firebase App ---
const firebaseApp = initializeApp(firebaseConfig);

// --- Inisialisasi Firestore dan Auth, lalu ekspor ---
export const db = getFirestore(firebaseApp); // Ekspor instance Firestore
export const auth = getAuth(firebaseApp);   // Ekspor instance Auth

// --- Buat instance Vue App ---
const app = createApp(App);

// --- Gunakan Pinia dan Vue Router ---
app.use(createPinia());
app.use(router);

// --- Pasang aplikasi Vue ---
app.mount('#app');
