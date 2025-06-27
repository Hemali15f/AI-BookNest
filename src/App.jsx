import React, { useState, useEffect, useContext } from 'react';
import Navbar from './components/Common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import Onboarding from './components/Onboarding/Onboarding';
import Home from './components/Books/Home';
import BookDetail from './components/Books/BookDetail';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import Profile from './components/User/Profile';

import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { CartProvider, CartContext } from './contexts/CartContext';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseApp;
let db;
let auth;

function AppContent() {
  const { isLoggedIn, user, isAdmin, setAuthState, authReady } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isFirebaseInitialized, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (!firebaseApp) {
      console.log('App.jsx: Initializing Firebase app...');
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
      };

      if (firebaseConfig.projectId) {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);
        console.log('App.jsx: Firebase initialized.');

        setIsFirebaseReady(true);

        // const handleInitialSignIn = async () => {
        //   if (!auth.currentUser && !window._userManuallyLoggedOut) {
        //     try {
        //       await signInAnonymously(auth);
        //       console.log('App.jsx: Signed in anonymously.');
        //     } catch (error) {
        //       console.error('App.jsx: Anonymous sign-in failed:', error);
        //     }
        //   }
        // };
        // handleInitialSignIn();
      } else {
        console.warn('App.jsx: Missing Firebase config.');
        setIsFirebaseReady(true);
      }
    } else {
      console.log('App.jsx: Firebase already initialized.');
      setIsFirebaseReady(true);
    }

    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      console.log('App.jsx: onAuthStateChanged triggered. UID:', firebaseUser ? firebaseUser.uid : 'null');
      if (!firebaseUser && window._userManuallyLoggedOut) {
        console.log("App.jsx: Skipping automatic anonymous login due to manual logout.");
        delete window._userManuallyLoggedOut; // Reset flag
        return;
      }
      setAuthState(firebaseUser, auth, db);
    });

    return () => {
      console.log('App.jsx: Cleaning up onAuthStateChanged.');
      unsubscribe();
    };
  }, [setAuthState]);

  useEffect(() => {
    console.log('--- App.jsx NAVIGATION EFFECT TRIGGERED ---');
    console.log(`  isFirebaseInitialized: ${isFirebaseInitialized}`);
    console.log(`  authReady: ${authReady}`);
    console.log(`  isLoggedIn: ${isLoggedIn}`);
    console.log(`  isAdmin: ${isAdmin}`);
    console.log(`  currentPage: ${currentPage}`);
    console.log(`  user profile (exists: ${!!user}, country: ${user?.country}, genres length: ${user?.genres?.length || 0})`);

    if (!isFirebaseInitialized || !authReady) {
      setCurrentPage('loading');
      return;
    }

    if (isAdmin) {
      if (currentPage !== 'adminDashboard') {
        setCurrentPage('adminDashboard');
      }
    } else if (isLoggedIn) {
      const userNeedsOnboarding = !user?.country || !user?.genres || user.genres.length === 0;
      if (userNeedsOnboarding) {
        if (currentPage !== 'onboarding') setCurrentPage('onboarding');
      } else {
        if (
          currentPage === 'login' ||
          currentPage === 'register' ||
          currentPage === 'onboarding' ||
          currentPage === 'adminLogin' ||
          currentPage === 'adminDashboard'
        ) {
          if (currentPage !== 'home') setCurrentPage('home');
        }
      }
    } else {
      if (currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'adminLogin') {
        setCurrentPage('login');
      }
    }
  }, [isLoggedIn, user, isAdmin, currentPage, isFirebaseInitialized, authReady]);

  const navigate = (page, data = null) => {
    console.log(`App.jsx: navigate called to ${page}`);
    setCurrentPage(page);
    if (page === 'bookDetail' && data) {
      setSelectedBook(data);
    }
  };

  const renderPage = () => {
    if (currentPage === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-xl text-gray-700">Loading application (Firebase initializing)...</p>
        </div>
      );
    }

    if (isAdmin) return <AdminDashboard navigate={navigate} />;
    if (!isLoggedIn && currentPage !== 'register' && currentPage !== 'adminLogin') return <Login navigate={navigate} />;

    switch (currentPage) {
      case 'login': return <Login navigate={navigate} />;
      case 'register': return <Register navigate={navigate} />;
      case 'adminLogin': return <AdminLogin navigate={navigate} />;
      case 'adminDashboard': return <AdminDashboard navigate={navigate} />;
      case 'onboarding': return <Onboarding navigate={navigate} />;
      case 'home': return <Home navigate={navigate} setSelectedBook={setSelectedBook} />;
      case 'bookDetail': return <BookDetail book={selectedBook} navigate={navigate} />;
      case 'cart': return <Cart navigate={navigate} />;
      case 'checkout': return <Checkout navigate={navigate} />;
      case 'profile': return <Profile navigate={navigate} />;
      default: return isLoggedIn ? <Home navigate={navigate} setSelectedBook={setSelectedBook} /> : <Login navigate={navigate} />;
    }
  };

  return (
    <div className="font-inter antialiased text-gray-900 bg-gray-100 min-h-screen">
      <Navbar navigate={navigate} cartItemCount={cartItems.length} />
      <main className="min-h-screen pt-16">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
