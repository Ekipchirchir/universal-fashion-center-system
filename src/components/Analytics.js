import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = ({ token }) => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  const chartData = {
    labels: analytics.map((item) => item.product),
    datasets: [
      {
        label: 'Total Revenue ($)',
        data: analytics.map((item) => item.totalRevenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit ($)',
        data: analytics.map((item) => item.profit),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Analytics by Product' },
    },
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Analytics</h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Total Quantity</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Total Revenue ($)</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Total Cost ($)</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Profit ($)</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item) => (
              <tr key={item.product} className="border-t">
                <td className="p-3">{item.product}</td>
                <td className="p-3">{item.totalQuantity}</td>
                <td className="p-3">{item.totalRevenue}</td>
                <td className="p-3">{item.totalCost}</td>
                <td className="p-3">{item.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;