import { defineStore } from 'pinia';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../main';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
    isLoading: false,
    error: null,
    authInitialized: false,
  }),
  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userDataFromFirestore = {};
        if (userDocSnap.exists()) {
          userDataFromFirestore = userDocSnap.data();
        } else {
          userDataFromFirestore = {
            name: user.displayName || user.email,
            email: user.email,
            // nim, programStudi, avatar dihilangkan
          };
          await setDoc(userDocRef, userDataFromFirestore, { merge: true });
        }

        this.user = {
          id: user.uid,
          name: userDataFromFirestore.name || user.displayName || user.email,
          email: userDataFromFirestore.email || user.email,
          // nim, programStudi, avatar dihilangkan
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
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: userData.name,
          email: userData.email,
          // nim, programStudi, avatar dihilangkan
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

    async updateUserProfile(uid, updatedProfileData) {
      this.isLoading = true;
      this.error = null;
      try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, updatedProfileData);

        this.user = {
          ...this.user,
          name: updatedProfileData.name,
          // nim, programStudi, semester dihilangkan
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

    initAuthListener() {
      if (this.authInitialized) return;
      this.authInitialized = true;

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.isAuthenticated = true;
          this.token = await user.getIdToken();

          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          let userDataFromFirestore = {};
          if (userDocSnap.exists()) {
            userDataFromFirestore = userDocSnap.data();
          } else {
            userDataFromFirestore = {
              name: user.displayName || user.email,
              email: user.email,
              // nim, programStudi, avatar dihilangkan
            };
            await setDoc(userDocRef, userDataFromFirestore, { merge: true });
          }

          this.user = {
            id: user.uid,
            name: userDataFromFirestore.name || user.displayName || user.email,
            email: userDataFromFirestore.email || user.email,
            // nim, programStudi, avatar dihilangkan
          };

          localStorage.setItem('userToken', this.token);
          localStorage.setItem('userData', JSON.stringify(this.user));
          console.log('Auth state changed: User is logged in.', this.user);
        } else {
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
