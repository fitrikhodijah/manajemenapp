import { defineStore } from 'pinia';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // Impor updateDoc dan getDoc
import { db, auth } from '../main'; // Impor instance db dan auth dari main.js

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        const user = userCredential.user;

        // Inisialisasi objek user lokal dengan data dasar dari Firebase Auth
        this.user = {
          id: user.uid,
          name: user.displayName || user.email, // displayName mungkin kosong dari Firebase Auth
          email: user.email,
          nim: '', // Akan diisi dari Firestore
          programStudi: '' // Akan diisi dari Firestore
        };
        this.isAuthenticated = true;
        this.token = await user.getIdToken();

        // --- Ambil data profil tambahan dari Firestore jika ada ---
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          // Gabungkan data dari Firestore dengan data user dasar
          this.user = { ...this.user, ...userDocSnap.data() };
        } else {
          // Jika dokumen user belum ada di Firestore (misal, user lama dari json-server atau register gagal sebagian)
          // Anda bisa memutuskan untuk membuat dokumen dasar di sini atau membiarkannya kosong.
          // Untuk konsistensi, sebaiknya buat dokumen dasar.
          await setDoc(userDocRef, {
            name: user.displayName || user.email,
            email: user.email,
            nim: '',
            programStudi: '',
            avatar: user.photoURL || 'https://via.placeholder.com/30'
          }, { merge: true }); // Gunakan merge agar tidak menimpa jika sudah ada
        }

        localStorage.setItem('userToken', this.token);
        localStorage.setItem('userData', JSON.stringify(this.user));

        return true;
      } catch (err) {
        this.error = err.message;
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData) {
      this.isLoading = true;
      this.error = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const user = userCredential.user;

        // --- Simpan data profil tambahan ke Firestore ---
        await setDoc(doc(db, "users", user.uid), {
          name: userData.name,
          email: userData.email,
          nim: userData.nim || '', // Pastikan nim disertakan
          programStudi: userData.programStudi || '', // Pastikan programStudi disertakan
          avatar: userData.avatar || 'https://via.placeholder.com/30' // Pastikan avatar disertakan
        });

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      await signOut(auth);

      this.user = null;
      this.isAuthenticated = false;
      this.token = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      this.error = null;
    },

    /**
     * Aksi baru untuk memperbarui profil pengguna di Firestore.
     * @param {string} uid - User ID dari pengguna yang akan diperbarui.
     * @param {object} updatedProfileData - Data profil yang diperbarui (misal: name, nim, programStudi, semester).
     */
    async updateUserProfile(uid, updatedProfileData) {
      this.isLoading = true;
      this.error = null;
      try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, updatedProfileData);

        // Perbarui state user lokal setelah berhasil update
        // Pastikan properti yang diupdate sesuai dengan yang ada di state.user
        this.user = {
          ...this.user,
          name: updatedProfileData.name,
          nim: updatedProfileData.nim,
          programStudi: updatedProfileData.programStudi,
          semester: updatedProfileData.semester, // Jika semester juga diupdate
          // avatar: updatedProfileData.avatar, // Jika avatar juga diupdate
        };
        localStorage.setItem('userData', JSON.stringify(this.user));

        return true;
      } catch (err) {
        this.error = err.message;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    checkAuth() {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
      }
    }
  },
});
