import React, { useState, useContext, useEffect } from 'react';
// import { LogIn } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext'; // Ensure this path is correct

const Login = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoggedIn, authReady } = useContext(AuthContext); // Get isLoggedIn and authReady

  // Use an effect to navigate *after* AuthContext confirms login
  useEffect(() => {
    // Only navigate if authReady is true AND isLoggedIn is true
    // Also check if user object is not null, ensuring it's available for App.jsx navigation logic
    if (authReady && isLoggedIn) {
      console.log('Login.jsx useEffect: authReady and isLoggedIn are true. Navigating to home.');
      // The App.jsx useEffect will handle whether to go to 'home' or 'onboarding'
      // We just need to trigger a navigation to a "post-login" state.
      navigate('home'); 
    } else if (authReady && !isLoggedIn) {
      console.log('Login.jsx useEffect: authReady is true, but isLoggedIn is false. Staying on login page.');
    } else {
      console.log('Login.jsx useEffect: Waiting for authReady to be true before checking login status.');
    }
  }, [authReady, isLoggedIn, navigate]); // Depend on authReady and isLoggedIn

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    setError('');

    // Do not attempt login if Firebase Auth is not ready yet
    if (!authReady) {
      setError("Authentication service is not ready. Please wait a moment and try again.");
      console.warn("Login.jsx: Attempted login before authReady.");
      return;
    }

    console.log('Login.jsx: Attempting to call login from AuthContext...');
    const { success, error: loginError } = await login(email, password); // Await the login call

    if (!success) {
      setError(loginError || 'Login failed. Please check your credentials.');
      console.error('Login.jsx: Login failed from AuthContext:', loginError);
    }
    // No direct navigation here. The useEffect above will handle navigation once isLoggedIn and authReady update.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 pt-20">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Welcome Back!</h2>
        <p className="text-center text-gray-600 mb-8">Sign in to explore your next favorite book.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg transform hover:scale-105"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold" onClick={() => navigate('register')}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
