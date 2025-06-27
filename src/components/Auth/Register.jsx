import React, { useState, useContext, useEffect } from 'react';
// import { UserPlus } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext'; // Ensure this path is correct

const Register = ({ navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoggedIn, authReady } = useContext(AuthContext); // Get isLoggedIn and authReady

  // Use an effect to navigate *after* AuthContext confirms registration
  useEffect(() => {
    if (authReady && isLoggedIn) {
      console.log('Register.jsx useEffect: authReady and isLoggedIn are true after registration. Navigating to onboarding.');
      // The App.jsx useEffect will determine if it goes to 'onboarding' or 'home'
      navigate('onboarding'); // Initial navigation to onboarding
    } else if (authReady && !isLoggedIn) {
      console.log('Register.jsx useEffect: authReady is true, but isLoggedIn is false. Staying on register page.');
    } else {
      console.log('Register.jsx useEffect: Waiting for authReady to be true before checking registration status.');
    }
  }, [authReady, isLoggedIn, navigate]); // Depend on authReady and isLoggedIn

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    setError('');

    if (!authReady) {
      setError("Authentication service is not ready. Please wait a moment and try again.");
      console.warn("Register.jsx: Attempted registration before authReady.");
      return;
    }

    console.log('Register.jsx: Attempting to call register from AuthContext...');
    const { success, error: registerError } = await register(email, password, name); // Await the register call

    if (!success) {
      setError(registerError || 'Registration failed. Please try again.');
      console.error('Register.jsx: Registration failed from AuthContext:', registerError);
    }
    // No direct navigation here. The useEffect above will handle navigation.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-200 p-4 pt-20">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Join AI BOOKNEST!</h2>
        <p className="text-center text-gray-600 mb-8">Create your account and discover amazing books.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 text-lg"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 text-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 text-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-300 shadow-lg text-lg transform hover:scale-105"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <span className="text-purple-600 hover:text-purple-800 cursor-pointer font-semibold" onClick={() => navigate('login')}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
