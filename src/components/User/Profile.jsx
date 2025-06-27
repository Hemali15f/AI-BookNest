import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { User, Globe, BookText, Lock } from 'lucide-react';

const Profile = ({ navigate }) => {
  const { user, logout, isAdmin, authReady, userId } = useContext(AuthContext); // Added authReady and userId

  // Show loading while Firebase Auth is not ready
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  // If user is not logged in AND not an admin, redirect to login
  if (!user && !isAdmin) { // user will be null if not logged in
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 pt-20">
        <User className="w-24 h-24 text-gray-400 mb-6" />
        <p className="text-3xl font-semibold text-gray-700 mb-4">Please log in to view your profile.</p>
        <button
          onClick={() => navigate('login')}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-xl font-semibold"
        >
          Login Now
        </button>
      </div>
    );
  }

  // If user is admin, show a simpler admin profile view or redirect to admin dashboard
  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 pt-20">
        <Lock className="w-24 h-24 text-gray-700 mb-6" />
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Admin Profile</h2>
        <p className="text-lg text-gray-500 mb-8">You are logged in as an administrator.</p>
        <button
          onClick={() => navigate('adminDashboard')}
          className="bg-gray-700 text-white px-8 py-4 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 transform hover:scale-105 text-xl font-semibold"
        >
          Go to Admin Dashboard
        </button>
        <button
          onClick={logout}
          className="mt-4 bg-red-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-semibold text-lg"
        >
          Logout Admin
        </button>
      </div>
    );
  }

  // Regular user profile view
  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto py-8">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12">Your Profile</h1>

        <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-500 text-white rounded-full w-28 h-28 flex items-center justify-center text-5xl font-bold mb-4 shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?')}
            </div>
            <h2 className="text-3xl font-bold text-gray-800">{user?.name || user?.email || 'AI Booknest User'}</h2>
            <p className="text-gray-600 text-lg">User ID: <span className="font-mono text-sm break-all">{userId || 'N/A'}</span></p> {/* Display userId */}
            <p className="text-gray-600 text-lg">{user?.email}</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <div className="flex items-center">
              <Globe className="w-6 h-6 mr-3 text-blue-600" />
              <p className="text-xl">Country: <span className="font-semibold">{user?.country || 'Not specified'}</span></p>
            </div>
            {user?.country && user?.currencySymbol && (
              <div className="flex items-center">
                <span className="text-blue-600 text-3xl font-bold mr-3">{user.currencySymbol}</span>
                <p className="text-xl">Currency: <span className="font-semibold">{user.currencySymbol} ({user.currencyCode || 'N/A'})</span></p>
              </div>
            )}
            <div>
              <div className="flex items-center mb-2">
                <BookText className="w-6 h-6 mr-3 text-purple-600" />
                <p className="text-xl">Preferred Genres:</p>
              </div>
              {user?.genres && user.genres.length > 0 ? (
                <div className="flex flex-wrap gap-2 pl-9">
                  {user.genres.map(genre => (
                    <span key={genre} className="bg-purple-100 text-purple-800 text-base px-4 py-1 rounded-full font-medium shadow-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 pl-9">No genres selected yet. Go to onboarding to choose!</p>
              )}
            </div>
          </div>

          <div className="mt-10 flex justify-center space-x-4">
            <button
              onClick={() => navigate('onboarding')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 transition duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              Update Preferences
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;