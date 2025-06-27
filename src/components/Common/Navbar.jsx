import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { LogIn, UserPlus, Home as HomeIcon, ShoppingCart, User, Users } from 'lucide-react';

const Navbar = ({ navigate, cartItemCount }) => {
  const { isLoggedIn, logout, user, isAdmin } = useContext(AuthContext);

  return (
    <nav className="bg-gray-900 p-4 shadow-lg fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <img
          src="/Logo.png"
          alt="AI BookNest Logo"
          className="h-16 cursor-pointer"
          onClick={() => navigate('home')}
        />

        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          {!isAdmin && (
            <button className="flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('home')}>
              <HomeIcon className="w-5 h-5 mr-1" /> Home
            </button>
          )}

          {!isAdmin && (
            <button className="relative flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('cart')}>
              <ShoppingCart className="w-5 h-5 mr-1" /> Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {isAdmin ? (
            <>
              <button className="flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('adminDashboard')}>
                <Users className="w-5 h-5 mr-1" /> Admin Panel
              </button>
              <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 shadow-md" onClick={logout}>
                Logout
              </button>
            </>
          ) : isLoggedIn ? (
            <>
              <button className="flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('profile')}>
                <User className="w-5 h-5 mr-1" /> {user?.name || 'Profile'}
              </button>
              <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 shadow-md" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('login')}>
                <LogIn className="w-5 h-5 mr-1" /> Login
              </button>
              <button className="flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('register')}>
                <UserPlus className="w-5 h-5 mr-1" /> Register
              </button>
              <button className="flex items-center text-gray-300 hover:text-white transition duration-300 p-2 rounded-md hover:bg-gray-700" onClick={() => navigate('adminLogin')}>
                <Users className="w-5 h-5 mr-1" /> Admin Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;