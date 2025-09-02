import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import SalesForm from './SalesForm';
import SalesList from './SalesList';
import Analytics from './Analytics';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';
import useWebSocket from './useWebSocket';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = ({ token, setToken }) => {
  const [filter, setFilter] = useState('daily');
  const queryClient = useQueryClient();

  // Enhanced token expiration check
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      console.log('Token exp check:', { token: token.substring(0, 10) + '...', exp: new Date(exp).toLocaleString(), current: new Date().toLocaleString() });
      if (exp < Date.now()) {
        console.log('Token expired, triggering logout:', token.substring(0, 10) + '...');
        toast.error('Your session has expired. Please log in again.');
        setToken(null); // Trigger re-login
      }
    } catch (e) {
      console.error('Invalid token format:', { token: token.substring(0, 10) + '...', error: e.message });
      toast.error('Invalid session. Please log in again.');
      setToken(null);
    }
  }, [token, setToken]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData', filter, token],
    queryFn: async () => {
      console.log('API call with token:', token.substring(0, 10) + '...', 'Filter:', filter);
      const [summaryResponse, trendResponse, lowStockResponse] = await Promise.all([
        axios.get('https://ufc.up.railway.app/api/sales/summary', {
          headers: { Authorization: `Bearer ${token}` },
          params: { filter },
        }).catch((err) => {
          console.error('Sales summary fetch failed:', { message: err.response?.data || err.message, token: token.substring(0, 10) + '...' });
          toast.error('Failed to fetch sales summary: ' + (err.response?.data?.message || err.message));
          return { data: { totalSales: 0, totalRevenue: 0, totalProfit: 0, recentSales: [], topProducts: [] } };
        }),
        axios.get('https://ufc.up.railway.app/api/sales/trend', {
          headers: { Authorization: `Bearer ${token}` },
          params: { filter },
        }).catch((err) => {
          console.error('Sales trend fetch failed:', { message: err.response?.data || err.message, token: token.substring(0, 10) + '...' });
          toast.error('Failed to fetch sales trend: ' + (err.response?.data?.message || err.message));
          return { data: [] };
        }),
        axios.get('https://ufc.up.railway.app/api/inventory/low-stock', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => {
          console.error('Inventory low-stock fetch failed:', { message: err.response?.data || err.message, token: token.substring(0, 10) + '...' });
          toast.error('Failed to fetch low stock data: ' + (err.response?.data?.message || err.message));
          return { data: [] };
        }),
      ]);
      console.log('Raw API Responses:', {
        summary: summaryResponse.data,
        trend: trendResponse.data,
        lowStock: lowStockResponse.data
      });
      return {
        summary: summaryResponse.data || { totalSales: 0, totalRevenue: 0, totalProfit: 0, recentSales: [], topProducts: [] },
        trendData: trendResponse.data || [],
        lowStock: lowStockResponse.data || [],
      };
    },
    onError: (err) => {
      console.error('Dashboard query error:', { message: err.message, token: token.substring(0, 10) + '...' });
      toast.error('Failed to load dashboard data: ' + err.message);
    },
    retry: 2,
    retryDelay: 1000,
  });

  console.log('Dashboard Data:', { isLoading, error, data });

  const lowStockAlerts = useWebSocket(token);

  useEffect(() => {
    const handleSaleRecorded = () => {
      queryClient.invalidateQueries(['dashboardData', filter, token]);
    };
    window.addEventListener('saleRecorded', handleSaleRecorded);
    return () => window.removeEventListener('saleRecorded', handleSaleRecorded);
  }, [queryClient, filter, token]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const formatDateLabel = (date, filter) => {
    const d = new Date(date);
    if (isNaN(d)) return 'Invalid Date';
    if (filter === 'daily') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (filter === 'weekly') return `Week ${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const revenueChartData = {
    labels: data?.trendData?.map((item) => formatDateLabel(item.date, filter)) || ['Sep 02, 09:35'],
    datasets: [
      {
        label: 'Revenue (Kes)',
        data: data?.trendData?.map((item) => (item.totalRevenue || 0)) || [1000],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const profitChartData = {
    labels: data?.trendData?.map((item) => formatDateLabel(item.date, filter)) || ['Sep 02, 09:35'],
    datasets: [
      {
        label: 'Profit (Kes)',
        data: data?.trendData?.map((item) => (item.totalProfit || 0)) || [500],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const productChartData = {
    labels: data?.summary?.topProducts?.map((item) => item.product || 'Sample Product') || ['Sample Product'],
    datasets: [
      {
        label: 'Revenue (Kes)',
        data: data?.summary?.topProducts?.map((item) => (item.totalRevenue || 0)) || [2000],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Quantity Sold',
        data: data?.summary?.topProducts?.map((item) => (item.totalQuantity || 0)) || [5],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14, family: 'Arial' }, color: '#1f2937' },
      },
      title: {
        display: true,
        font: { size: 18, family: 'Arial', weight: 'bold' },
        color: '#1f2937',
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return context.dataset.label === 'Revenue (Kes)'
              ? `${context.dataset.label}: ${value.toFixed(2)} Kes`
              : `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 12 }, maxRotation: 45, minRotation: 45, color: '#1f2937' },
        grid: { display: false },
      },
      y: {
        ticks: {
          font: { size: 12 },
          color: '#1f2937',
          callback: (value) => `${value.toFixed(0)} Kes`,
        },
        title: { display: true, text: 'Revenue (Kes)', font: { size: 14 }, color: '#1f2937' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        beginAtZero: true,
      },
    },
  };

  const productChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: { font: { size: 12 }, maxRotation: 45, minRotation: 45, color: '#1f2937' },
        grid: { display: false },
      },
      y: {
        ticks: {
          font: { size: 12 },
          color: '#1f2937',
          callback: (value) => `${value.toFixed(0)} Kes`,
        },
        title: { display: true, text: 'Revenue (Kes)', font: { size: 14 }, color: '#1f2937' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        beginAtZero: true,
      },
      y1: {
        position: 'right',
        ticks: {
          font: { size: 12 },
          color: '#1f2937',
          callback: (value) => `${value}`,
        },
        title: { display: true, text: 'Quantity Sold', font: { size: 14 }, color: '#1f2937' },
        grid: { display: false },
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg bg-gray-100 dark:bg-gray-900 min-h-screen"
      >
        Loading dashboard data...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 text-center text-red-600 dark:text-red-400 text-base sm:text-lg bg-gray-100 dark:bg-gray-900 min-h-screen"
      >
        Error loading dashboard data. Please check your connection, token, or try logging in again.
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar setToken={setToken} />
      <div className="flex-1 ml-0 md:ml-[300px] p-4 sm:p-6">
        <Routes>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
                <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Filter Trends</h3>
                  <select
                    id="filter"
                    value={filter}
                    onChange={handleFilterChange}
                    className="w-full sm:w-48 p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                    aria-label="Select trend filter"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  <motion.div
                    className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">Total Sales</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{data?.summary?.totalSales || 0}</p>
                  </motion.div>
                  <motion.div
                    className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">Total Revenue</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">Kes {(data?.summary?.totalRevenue || 0).toFixed(2)}</p>
                  </motion.div>
                  <motion.div
                    className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">Total Profit</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">Kes {(data?.summary?.totalProfit || 0).toFixed(2)}</p>
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="card h-[300px] sm:h-[400px] p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue Trend</h3>
                    <div className="h-[240px] sm:h-[340px]">
                      <Line
                        data={revenueChartData}
                        options={{
                          ...chartOptions,
                          plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Revenue Trend' } },
                        }}
                      />
                    </div>
                  </div>
                  <div className="card h-[300px] sm:h-[400px] p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Profit Trend</h3>
                    <div className="h-[240px] sm:h-[340px]">
                      <Line
                        data={profitChartData}
                        options={{
                          ...chartOptions,
                          plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Profit Trend' } },
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card h-[300px] sm:h-[400px] p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Products Performance</h3>
                  <div className="h-[240px] sm:h-[340px]">
                    <Bar data={productChartData} options={productChartOptions} />
                  </div>
                </div>
                <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="/dashboard/sales-form"
                      className="btn-primary text-center text-sm sm:text-base py-2 rounded-lg"
                      aria-label="Record a sale"
                    >
                      Record Sale
                    </a>
                    <a
                      href="/dashboard/sales"
                      className="btn-primary text-center text-sm sm:text-base py-2 rounded-lg"
                      aria-label="View sales records"
                    >
                      View Sales
                    </a>
                    <a
                      href="/dashboard/analytics"
                      className="btn-primary text-center text-sm sm:text-base py-2 rounded-lg"
                      aria-label="View analytics"
                    >
                      View Analytics
                    </a>
                    <a
                      href="/dashboard/inventory-form"
                      className="btn-primary text-center text-sm sm:text-base py-2 rounded-lg"
                      aria-label="Manage inventory"
                    >
                      Manage Inventory
                    </a>
                    <a
                      href="/dashboard/inventory"
                      className="btn-primary text-center text-sm sm:text-base py-2 rounded-lg"
                      aria-label="View inventory"
                    >
                      View Inventory
                    </a>
                  </div>
                </div>
                <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Low Stock Alerts</h3>
                  {data?.lowStock?.length > 0 || lowStockAlerts.length > 0 ? (
                    <ul className="space-y-2">
                      {[...(data?.lowStock || []), ...lowStockAlerts].map((item, index) => (
                        <li key={index} className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                          {item.product}: {item.stock} units (below threshold of {item.lowStockThreshold})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">No low stock alerts</p>
                  )}
                </div>
                <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Sales</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-200 dark:bg-gray-700">
                        <tr>
                          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-left">Product</th>
                          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-left">Quantity</th>
                          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-left">Total Price (Kes)</th>
                          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-left">Profit (Kes)</th>
                          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.summary?.recentSales?.length > 0 ? (
                          data.summary.recentSales.map((sale) => (
                            <tr key={sale._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-white">{sale.product}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-white">{sale.quantity}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-white">{sale.totalPrice.toFixed(2)}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-white">{sale.profit.toFixed(2)}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-white">{new Date(sale.date).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="p-2 sm:p-3 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                              No recent sales available for this filter
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            }
          />
          <Route path="/sales-form" element={<SalesForm token={token} />} />
          <Route path="/sales" element={<SalesList token={token} />} />
          <Route path="/analytics" element={<Analytics token={token} />} />
          <Route path="/inventory-form" element={<InventoryForm token={token} />} />
          <Route path="/inventory" element={<InventoryList token={token} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
