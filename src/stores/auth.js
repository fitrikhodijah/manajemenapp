import { defineStore } from 'pinia';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; // onAuthStateChanged diperlukan
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // updateDoc dan getDoc diperlukan
import { db, auth } from '../main'; // Impor instance db dan auth dari main.js

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
    isLoading: false,
    error: null,
    authInitialized: false, // State untuk melacak apakah listener auth sudah diinisialisasi
  }),
  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance 'auth' yang diimpor dari main.js
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        const user = userCredential.user;

        // Ambil data profil tambahan dari Firestore
        // Gunakan instance 'db' yang diimpor dari main.js
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userDataFromFirestore = {};
        if (userDocSnap.exists()) {
          userDataFromFirestore = userDocSnap.data();
        } else {
          // Jika dokumen user belum ada di Firestore, buat dokumen dasar
          userDataFromFirestore = {
            name: user.displayName || user.email,
            email: user.email,
            nim: '',
            programStudi: '',
            avatar: user.photoURL || 'https://via.placeholder.com/30'
          };
          await setDoc(userDocRef, userDataFromFirestore, { merge: true });
        }

        // Set state user lokal
        this.user = {
          id: user.uid,
          name: userDataFromFirestore.name || user.displayName || user.email,
          email: userDataFromFirestore.email || user.email,
          nim: userDataFromFirestore.nim || '',
          programStudi: userDataFromFirestore.programStudi || '',
          avatar: userDataFromFirestore.avatar || user.photoURL || 'https://via.placeholder.com/30'
        };
        this.isAuthenticated = true;
        this.token = await user.getIdToken();

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
        // Gunakan instance 'auth' yang diimpor dari main.js
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const user = userCredential.user;

        // Simpan data profil tambahan ke Firestore
        // Gunakan instance 'db' yang diimpor dari main.js
        await setDoc(doc(db, "users", user.uid), {
          name: userData.name,
          email: userData.email,
          nim: userData.nim || '',
          programStudi: userData.programStudi || '',
          avatar: userData.avatar || 'https://via.placeholder.com/30'
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
      // Gunakan instance 'auth' yang diimpor dari main.js
      await signOut(auth);

      this.user = null;
      this.isAuthenticated = false;
      this.token = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      this.error = null;
    },

    /**
     * Aksi untuk memperbarui profil pengguna di Firestore.
     * @param {string} uid - User ID dari pengguna yang akan diperbarui.
     * @param {object} updatedProfileData - Data profil yang diperbarui (misal: name, nim, programStudi, semester).
     */
    async updateUserProfile(uid, updatedProfileData) {
      this.isLoading = true;
      this.error = null;
      try {
        // Gunakan instance 'db' yang diimpor dari main.js
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, updatedProfileData);

        // Perbarui state user lokal setelah berhasil update
        this.user = {
          ...this.user,
          name: updatedProfileData.name,
          nim: updatedProfileData.nim,
          programStudi: updatedProfileData.programStudi,
          semester: updatedProfileData.semester,
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

    // --- Perbaikan: Gunakan onAuthStateChanged untuk initAuthListener yang lebih robust ---
    initAuthListener() {
      if (this.authInitialized) return; // Pastikan listener hanya diinisialisasi sekali
      this.authInitialized = true;

      onAuthStateChanged(auth, async (user) => { // Gunakan instance 'auth' yang diimpor
        if (user) {
          // User is signed in.
          this.isAuthenticated = true;
          this.token = await user.getIdToken();

          // Ambil data profil tambahan dari Firestore
          const userDocRef = doc(db, "users", user.uid); // Gunakan instance 'db' yang diimpor
          const userDocSnap = await getDoc(userDocRef);
          let userDataFromFirestore = {};
          if (userDocSnap.exists()) {
            userDataFromFirestore = userDocSnap.data();
          } else {
            // Jika dokumen user belum ada di Firestore, buat dokumen dasar
            userDataFromFirestore = {
              name: user.displayName || user.email,
              email: user.email,
              nim: '',
              programStudi: '',
              avatar: user.photoURL || 'https://via.placeholder.com/30'
            };
            await setDoc(userDocRef, userDataFromFirestore, { merge: true });
          }

          this.user = {
            id: user.uid,
            name: userDataFromFirestore.name || user.displayName || user.email,
            email: userDataFromFirestore.email || user.email,
            nim: userDataFromFirestore.nim || '',
            programStudi: userDataFromFirestore.programStudi || '',
            avatar: userDataFromFirestore.avatar || user.photoURL || 'https://via.placeholder.com/30'
          };

          localStorage.setItem('userToken', this.token);
          localStorage.setItem('userData', JSON.stringify(this.user));
          console.log('Auth state changed: User is logged in.', this.user);
        } else {
          // User is signed out.
          this.isAuthenticated = false;
          this.user = null;
          this.token = null;
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
          console.log('Auth state changed: User is logged out.');
        }
      });
    }
  },
});
