import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6">
      <h2 className="text-2xl font-bold mb-6">UFC Admin</h2>
      <nav className="space-y-4">
        <Link to="/dashboard" className="block p-3 hover:bg-gray-700 rounded">Dashboard</Link>
        <Link to="/dashboard/sales-form" className="block p-3 hover:bg-gray-700 rounded">Record Sale</Link>
        <Link to="/dashboard/sales" className="block p-3 hover:bg-gray-700 rounded">Sales Records</Link>
        <Link to="/dashboard/analytics" className="block p-3 hover:bg-gray-700 rounded">Analytics</Link>
        <Link to="/dashboard/inventory-form" className="block p-3 hover:bg-gray-700 rounded">Manage Inventory</Link>
        <Link to="/dashboard/inventory" className="block p-3 hover:bg-gray-700 rounded">View Inventory</Link>
        <button
          onClick={handleLogout}
          className="block w-full text-left p-3 hover:bg-gray-700 rounded"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;