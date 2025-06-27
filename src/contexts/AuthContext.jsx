import React, { createContext, useState, useEffect } from 'react';
import { getCurrencySymbol, COUNTRY_CURRENCY_MAP } from '../utils/currencyRates';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment
} from 'firebase/firestore';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // Flag indicates auth listener has run and profile is processed
  const [dbInstance, setDbInstance] = useState(null);
  const [authInstance, setAuthInstance] = useState(null);
  const [userId, setUserId] = useState(null);
  const [appId, setAppId] = useState(null);

  // This function is called by App.jsx's onAuthStateChanged listener AND immediately after Firebase.initializeApp
  const setAuthState = async (firebaseUser, authFromApp, dbFromApp) => {
    // 🔐 Prevent infinite loop if auth is already initialized
    if (authInstance && dbInstance && firebaseUser?.uid === userId) {
      console.log('AuthContext: setAuthState skipped (already processed for same user).');
      return;
    }

    // Set instances immediately as they are guaranteed to be passed from App.jsx
    setAuthInstance(authFromApp);
    setDbInstance(dbFromApp);

    // Resolve appId once. This should be consistent for a given local run.
    const currentAppId = process.env.REACT_APP_FIREBASE_APP_ID_FOR_FIRESTORE_PATH || 'local-dev-booknest';
    setAppId(currentAppId);
    console.log('AuthContext: App ID resolved for Firestore paths:', currentAppId);

    if (firebaseUser) {
      console.log('AuthContext: Firebase user detected:', firebaseUser.uid);
      const currentUserId = firebaseUser.uid;

      // Immediately set userId and isLoggedIn. This is essential for App.jsx to react.
      setUserId(currentUserId);
      setIsLoggedIn(true);
      setIsAdmin(false); // Assume not admin by default

      // Prepare initial user profile data based on Firebase user (might be incomplete)
      let userProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        country: '',
        genres: [],
        currencySymbol: '$',
        currencyCode: 'USD'
      };

      // Set user state with this basic Firebase auth data FIRST.
      // This ensures `user` is not null for App.jsx's navigation checks even while Firestore fetch is pending.
      setUser(userProfileData);
      console.log('AuthContext: Basic user state (from Firebase Auth) set immediately:', userProfileData.email);

      if (dbFromApp) {
        const userProfileRef = doc(dbFromApp, `artifacts/${currentAppId}/users/${currentUserId}/userProfiles/userProfileDoc`);
        console.log('AuthContext: Attempting to fetch user profile from Firestore:', userProfileRef.path);

        try {
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists()) {
            console.log('AuthContext: User profile found in Firestore. Merging data.');
            const fetchedData = docSnap.data();
            userProfileData = {
              ...userProfileData, // Start with basic Firebase user data
              ...fetchedData,    // Overlay with fetched Firestore data
              currencySymbol: fetchedData.country ? getCurrencySymbol(fetchedData.country) : '$',
              currencyCode: fetchedData.country ? (COUNTRY_CURRENCY_MAP[fetchedData.country]?.code || 'USD') : 'USD',
            };
          } else {
            console.log('AuthContext: No user profile found in Firestore, creating default.');
            await setDoc(userProfileRef, userProfileData, { merge: true }); // Create with initial combined data
          }
          // Update with final enriched data (or the created default)
          setUser(userProfileData);
          console.log('AuthContext: Final user state updated after Firestore ops:', userProfileData);

        } catch (error) {
          console.error('AuthContext: Error fetching/creating user profile from Firestore:', error.code, error.message);
          // Even if Firestore profile fails, proceed with the basic user data that was set initially.
          // The app will still attempt to render based on `isLoggedIn` and the basic `user` object.
        }
      } else {
        console.warn('AuthContext: Firestore instance not available to fetch user profile. App will use basic user data.');
      }

      // Set authReady to true ONLY AFTER all asynchronous data fetching/setting is done.
      setAuthReady(true);
      console.log('AuthContext: authReady set to true (Auth and Profile processing complete).');

    } else { // Firebase user is null (logged out state)
      console.log('AuthContext: No Firebase user detected (user is logged out).');
      // Explicitly clear all auth-related states
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUser(null); // Explicitly nullify user
      setUserId(null);

      setAuthReady(true); // Always set authReady to true when auth state has been fully processed, logged in or out.
      console.log('AuthContext: authReady set to true (logged out state processed).');
    }
  };
  const login = async (email, password) => {
    if (!authInstance) {
      console.error("AuthContext: Firebase Auth instance not initialized. Cannot log in.");
      return { success: false, error: "Authentication service not ready." };
    }

    try {
      console.log(`AuthContext: Attempting login for: ${email}`);

      // ❗ Delete anonymous user first to allow real login
      if (authInstance.currentUser?.isAnonymous) {
        console.warn("AuthContext: Deleting anonymous user before login...");
        await authInstance.currentUser.delete();
      }

      await signInWithEmailAndPassword(authInstance, email, password);
      console.log('AuthContext: signInWithEmailAndPassword successful. Awaiting onAuthStateChanged...');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Firebase login error:', error.code, error.message);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      }
      return { success: false, error: errorMessage };
    }
  };


  const adminLogin = (email, password) => {
    if (!authReady) {
      console.error("AuthContext: Authentication service not ready for admin login.");
      return { success: false, isAdmin: false, error: "Authentication service not ready." };
    }
    console.log(`AuthContext: Attempting admin login for: ${email}`);
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setUser({ id: 'admin-1', email: ADMIN_EMAIL, name: 'Admin User' });
      setUserId('admin-1');
      console.log('AuthContext: Admin logged in successfully.');
      return { success: true, isAdmin: true };
    }
    console.log('AuthContext: Admin login failed: Invalid credentials.');
    return { success: false, isAdmin: false, error: 'Invalid admin credentials.' };
  };

  const register = async (email, password, name) => {
    if (!authInstance) {
      console.error("AuthContext: Firebase Auth instance not initialized. Cannot register.");
      return { success: false, error: "Authentication service not ready." };
    }
    try {
      console.log(`AuthContext: Attempting registration for: ${email}`);
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const newFirebaseUser = userCredential.user;
      console.log('AuthContext: Firebase user registered:', newFirebaseUser.uid);

      if (dbInstance && appId) {
        const userProfileRef = doc(dbInstance, `artifacts/${appId}/users/${newFirebaseUser.uid}/userProfiles/userProfileDoc`);
        await setDoc(userProfileRef, {
          uid: newFirebaseUser.uid,
          email: newFirebaseUser.email,
          name: name,
          country: '', // Default empty, to be filled by onboarding
          genres: [],  // Default empty, to be filled by onboarding
          currencySymbol: '$',
          currencyCode: 'USD',
        });
        console.log('AuthContext: User profile created in Firestore for new user.');

        const adminStatsRef = doc(dbInstance, `artifacts/${appId}/adminData/dashboardStats`);
        try {
          await updateDoc(adminStatsRef, {
            totalRegisteredUsers: increment(1)
          });
          console.log('AuthContext: Incremented totalRegisteredUsers count in dashboardStats.');
        } catch (updateError) {
          console.warn('AuthContext: Could not increment totalRegisteredUsers. Document might not exist. Attempting to create/initialize.', updateError);
          await setDoc(adminStatsRef, {
            totalRegisteredUsers: 1,
            totalOrders: 0,
            totalRevenue: 0
          }, { merge: true });
        }
      } else {
        console.warn('AuthContext: Firestore or App ID not available for initial profile creation or stat increment.');
      }
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Firebase registration error:', error.code, error.message);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak (min 6 characters).';
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log('AuthContext: Attempting logout...');
    window._userManuallyLoggedOut = true;

    if (authInstance) {
      try {
        await signOut(authInstance); // Using Firebase's signOut
        console.log('AuthContext: User logged out from Firebase.');
      } catch (error) {
        console.error('AuthContext: Firebase logout error:', error.code, error.message);
      }
    }
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setUserId(null);
    if (userId) {
      localStorage.removeItem(`ai_booknest_cart_${userId}`);
    }
    console.log('AuthContext: Local state cleared after logout.');
  };

  const updateUserProfile = async (updates) => {
    if (!dbInstance || !userId || !appId) {
      console.error("AuthContext: Firestore, User ID, App ID not available for profile update.");
      return { success: false, error: "Service not ready." };
    }

    try {
      const userProfileRef = doc(dbInstance, `artifacts/${appId}/users/${userId}/userProfiles/userProfileDoc`);
      const updatedUser = { ...user, ...updates, uid: userId };

      if (updatedUser.country) {
        updatedUser.currencySymbol = getCurrencySymbol(updatedUser.country);
        updatedUser.currencyCode = COUNTRY_CURRENCY_MAP[updatedUser.country]?.code || 'USD';
      } else {
        updatedUser.currencySymbol = '$';
        updatedUser.currencyCode = 'USD';
      }

      await setDoc(userProfileRef, updatedUser, { merge: true });
      setUser(updatedUser);
      console.log('AuthContext: User profile updated in Firestore successfully.');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Error updating user profile:', error.code, error.message);
      return { success: false, error: 'Failed to update profile.' };
    }
  };

  const incrementOrderStats = async (orderTotalUSD) => {
    if (!dbInstance || !appId) {
      console.error("AuthContext: Firestore or App ID not available for order stats update.");
      return;
    }
    const adminStatsRef = doc(dbInstance, `artifacts/${appId}/adminData/dashboardStats`);
    try {
      await updateDoc(adminStatsRef, {
        totalOrders: increment(1),
        totalRevenue: increment(orderTotalUSD)
      });
      console.log('AuthContext: Incremented totalOrders and totalRevenue in dashboardStats.');
    } catch (error) {
      console.warn('AuthContext: Could not increment order stats. Document might not exist or permission denied. Attempting to create/initialize.', error);
      await setDoc(adminStatsRef, {
        totalRegisteredUsers: 0,
        totalOrders: 1,
        totalRevenue: 0
      }, { merge: true });
    }
  };


  useEffect(() => {
    let unsubscribeProfile = () => { };

    if (dbInstance && userId && appId && isLoggedIn && !isAdmin) {
      const userProfileRef = doc(dbInstance, `artifacts/${appId}/users/${userId}/userProfiles/userProfileDoc`);
      console.log('AuthContext: Setting up Firestore profile snapshot listener for:', userProfileRef.path);

      unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          console.log('AuthContext: Firestore profile data changed:', fetchedData);
          setUser(prevUser => {
            const updatedProfile = {
              ...prevUser, // Keep existing properties (like UID, email, name from Firebase Auth)
              ...fetchedData, // Overlay with new data from Firestore
              currencySymbol: fetchedData.country ? getCurrencySymbol(fetchedData.country) : '$',
              currencyCode: fetchedData.country ? (COUNTRY_CURRENCY_MAP[fetchedData.country]?.code || 'USD') : 'USD',
            };
            return updatedProfile;
          });
        } else {
          console.log("AuthContext: User profile document does not exist for current user. (Might be newly registered).");
          setUser(prevUser => ({
            ...prevUser, // Retain existing UID, email, name from Firebase Auth
            country: '',
            genres: [],
            currencySymbol: '$',
            currencyCode: 'USD',
          }));
        }
      }, (error) => {
        console.error("AuthContext: Error listening to user profile changes in Firestore:", error.code, error.message);
      });
    } else {
      console.log('AuthContext: Not setting up Firestore user profile listener (conditions not met).');
    }

    return () => {
      console.log('AuthContext: Cleaning up Firestore user profile snapshot listener.');
      unsubscribeProfile();
    };
  }, [dbInstance, userId, appId, isLoggedIn, isAdmin]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        user,
        userId,
        authReady,
        login,
        adminLogin,
        register,
        logout,
        updateUserProfile,
        setAuthState,
        dbInstance,
        appId,
        incrementOrderStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
