import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { MOCK_ADMIN_STATS } from '../../utils/constants';
import { Users, ShoppingBag, DollarSign, Activity, LogOut, Lock } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';

const AdminDashboard = ({ navigate }) => {
  const { isAdmin, logout, dbInstance, appId, authReady } = useContext(AuthContext);
  
  const [adminStats, setAdminStats] = useState(MOCK_ADMIN_STATS);
  // Set initial loading state based on whether auth is ready and if we have instances
  // We start true and set false once we get data or confirm conditions aren't met
  const [loadingStats, setLoadingStats] = useState(true); 

  useEffect(() => {
    let unsubscribe = () => {};

    // Check if auth system is ready AND we have dbInstance and appId
    // AND if the user is confirmed as admin
    if (authReady && dbInstance && appId && isAdmin) {
      console.log("AdminDashboard useEffect: Firebase instances and Auth ready for Admin.");
      console.log("AdminDashboard useEffect: Resolved App ID:", appId);
      setLoadingStats(true); // Start loading when conditions are met

      const adminStatsRef = doc(dbInstance, `artifacts/${appId}/adminData/dashboardStats`);
      console.log("AdminDashboard useEffect: Listening to Firestore document at path:", adminStatsRef.path);

      unsubscribe = onSnapshot(adminStatsRef, (docSnap) => {
        if (docSnap.exists()) {
          const fetchedStats = docSnap.data();
          console.log("AdminDashboard useEffect: Fetched real-time stats successfully:", fetchedStats);
          setAdminStats(fetchedStats);
        } else {
          console.warn("AdminDashboard useEffect: Firestore 'dashboardStats' document not found at path:", adminStatsRef.path, ". Displaying initial zeros/placeholders.");
          setAdminStats({
            totalRegisteredUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            recentActivities: MOCK_ADMIN_STATS.recentActivities
          });
        }
        setLoadingStats(false); // Data is now available or initialized
      }, (error) => {
        console.error("AdminDashboard useEffect: Error listening to admin stats:", error.code, error.message);
        setAdminStats({
          registeredUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          recentActivities: MOCK_ADMIN_STATS.recentActivities
        });
        setLoadingStats(false); // Loading finished, with error
      });
    } else if (authReady && !isAdmin) {
      // If auth is ready but user is not admin, stop loading and show access denied (handled by next if block)
      console.log("AdminDashboard useEffect: Auth ready, but user is NOT admin. Not fetching stats.");
      setLoadingStats(false); // No stats to load for non-admin
      setAdminStats(MOCK_ADMIN_STATS); // Ensure default state for non-admin
    } else {
      // Still waiting for authReady or other Firebase instances to be available
      console.log("AdminDashboard useEffect: Conditions not yet met (authReady, dbInstance, appId, isAdmin). Deferring fetch.");
      setLoadingStats(true); // Keep loading true while waiting
    }

    return () => {
      console.log("AdminDashboard useEffect: Cleaning up Firestore stats listener.");
      unsubscribe();
    };
  }, [dbInstance, appId, authReady, isAdmin]); // Dependencies

  // --- Initial Loading Check for the Component ---
  // Display a general loading message if Firebase/Auth isn't fully ready yet
  if (loadingStats && (!authReady || !dbInstance || !appId)) {
    console.log("AdminDashboard Render: Showing initial loading spinner for Firebase/Auth setup.");
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500 mr-4" />
        <p className="text-xl text-gray-700">Checking admin access and loading data...</p>
      </div>
    );
  }

  // --- Access Denied Check (after auth is ready and user is confirmed not admin) ---
  if (!isAdmin && authReady) {
    console.log("AdminDashboard Render: Showing Access Denied (Auth is ready, but not admin).");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 pt-20">
        <Lock className="w-24 h-24 text-red-400 mb-6" />
        <p className="text-3xl font-semibold text-gray-700 mb-4">Access Denied</p>
        <p className="text-lg text-gray-500 mb-8">You must be logged in as an administrator to view this page.</p>
        <button
          onClick={() => navigate('adminLogin')}
          className="bg-gray-700 text-white px-8 py-4 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 transform hover:scale-105 text-xl font-semibold"
        >
          Admin Login
        </button>
      </div>
    );
  }
  
  // --- Main Dashboard Render (only if isAdmin is true and loading is false) ---
  // The loadingStats will be false here if data has been fetched/initialized
  // or if isAdmin was false (handled by the previous if block).
  console.log("AdminDashboard Render: Rendering main dashboard. isAdmin:", isAdmin, "loadingStats:", loadingStats);
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="container mx-auto py-8">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12">Admin Dashboard</h1>

        {loadingStats ? ( // This loading state specifically for fetching stats
          <div className="text-center text-gray-600 text-xl flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 mr-3"></div>
            Loading admin statistics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 border border-blue-200">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">Registered Users</h3>
                  <p className="text-4xl font-bold text-gray-900">{adminStats.totalRegisteredUsers || 0}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 border border-green-200">
                <div className="p-4 bg-green-100 rounded-full">
                  <ShoppingBag className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">Total Orders</h3>
                  <p className="text-4xl font-bold text-gray-900">{adminStats.totalOrders || 0}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 border border-purple-200">
                <div className="p-4 bg-purple-100 rounded-full">
                  <DollarSign className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">Total Revenue (USD)</h3>
                  <p className="text-4xl font-bold text-gray-900">${(adminStats.totalRevenue || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="w-7 h-7 mr-3 text-teal-600" /> Recent Activities
              </h2>
              <ul className="divide-y divide-gray-200">
                {MOCK_ADMIN_STATS.recentActivities.map(activity => (
                  <li key={activity.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{activity.type}: {activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-center">
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 font-semibold text-lg flex items-center mx-auto"
                >
                  <LogOut className="w-5 h-5 mr-2" /> Logout Admin
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
