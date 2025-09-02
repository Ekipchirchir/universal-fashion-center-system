import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = ({ token }) => {
  const [sortBy, setSortBy] = useState('totalRevenue');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', token, sortBy, sortOrder],
    queryFn: async () => {
      const response = await axios.get('https://ufc.up.railway.app/api/sales/analytics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { sortBy, sortOrder },
      }); 
      return response.data;
    },
    onError: () => {
      toast.error('Failed to load analytics data');
    },
  });

  const chartData = {
    labels: analytics?.map((item) => item.product) || [],
    datasets: [
      {
        label: 'Total Revenue (Kes)',
        data: analytics?.map((item) => item.totalRevenue || 0) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit (Kes)',
        data: analytics?.map((item) => item.totalProfit || 0) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 } } },
      title: { display: true, text: 'Sales Analytics by Product', font: { size: 14 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } },
    },
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortBy(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg bg-gray-100 dark:bg-gray-900 min-h-screen"
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen"
    >
      <div className="card max-w-full sm:max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Sales Analytics</h2>
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => handleSort('totalRevenue')}
            className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
            aria-label="Sort by total revenue"
          >
            Sort by Revenue {sortBy === 'totalRevenue' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('totalProfit')}
            className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
            aria-label="Sort by profit"
          >
            Sort by Profit {sortBy === 'totalProfit' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        <div className="card mb-6 sm:mb-8 h-[300px] sm:h-[400px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Analytics Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Product</th>
                  <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Total Quantity</th>
                  <th
                    className="table-header cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2"
                    onClick={() => handleSort('totalRevenue')}
                  >
                    Total Revenue (Kes) {sortBy === 'totalRevenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Total Cost (Kes)</th>
                  <th
                    className="table-header cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2"
                    onClick={() => handleSort('totalProfit')}
                  >
                    Profit (Kes) {sortBy === 'totalProfit' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics?.map((item) => (
                  <tr key={item.product} className="table-row hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.product}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.totalQuantity}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{(item.totalRevenue || 0).toFixed(2)}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{(item.totalCost || 0).toFixed(2)}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{(item.totalProfit || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analytics?.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-center mt-4 text-xs sm:text-sm">No analytics data available</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
