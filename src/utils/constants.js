// src/utils/constants.js

export const ADMIN_EMAIL = 'admin@booknest.com';
export const ADMIN_PASSWORD = 'admin123';

// Mock Admin Dashboard Data (can be expanded)
export const MOCK_ADMIN_STATS = {
  registeredUsers: 1250,
  totalOrders: 890,
  totalRevenue: 45000.75,
  recentActivities: [
    { id: 1, type: 'Order', description: 'New order #001 from Jane Doe', time: '5 mins ago' },
    { id: 2, type: 'Registration', description: 'New user registered: user@example.com', time: '15 mins ago' },
    { id: 3, type: 'Order', description: 'Order #002 shipped', time: '1 hour ago' },
    { id: 4, type: 'Login', description: 'Admin login from IP 192.168.1.100', time: '2 hours ago' },
  ]
};