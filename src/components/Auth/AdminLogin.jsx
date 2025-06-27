// src/components/Auth/AdminLogin.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Lock } from 'lucide-react'; // Import icon for admin

const AdminLogin = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New: loading state for button
  const { adminLogin } = useContext(AuthContext); // Use adminLogin from context

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading

    const result = adminLogin(email, password); // Call adminLogin

    if (!result.success) {
      setError(result.error || 'Invalid admin credentials.');
    } else {
      // Navigation is handled by App.jsx's useEffect based on isAdmin
    }
    setLoading(false); // End loading
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 p-4 pt-20">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
          <Lock className="w-9 h-9 mr-3 text-gray-700" /> Admin Login
        </h2>
        <p className="text-center text-gray-600 mb-8">Enter fixed admin credentials to access the dashboard.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="adminEmail">
              Email Address
            </label>
            <input
              type="email"
              id="adminEmail"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-lg"
              placeholder="admin@booknest.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="adminPassword">
              Password
            </label>
            <input
              type="password"
              id="adminPassword"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'} text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg text-lg transform hover:scale-105 flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </>
            ) : (
              'Login as Admin'
            )}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          <span className="text-gray-600 hover:text-gray-800 cursor-pointer font-semibold" onClick={() => navigate('login')}>
            Back to User Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
