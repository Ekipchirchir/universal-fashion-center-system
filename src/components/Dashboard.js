import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import SalesForm from './SalesForm';
import SalesList from './SalesList';
import Analytics from './Analytics';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ token, setToken }) => {
  const [summary, setSummary] = useState({ totalSales: 0, totalRevenue: 0, totalProfit: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryResponse = await axios.get('http://localhost:5000/api/sales/summary', {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        });
        const trendResponse = await axios.get('http://localhost:5000/api/sales/trend', {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        });
        let lowStockResponse;
        try {
          lowStockResponse = await axios.get('http://localhost:5000/api/inventory/low-stock', {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (inventoryErr) {
          console.warn('Inventory data not available:', inventoryErr.message);
          lowStockResponse = { data: [] };
        }
        setSummary(summaryResponse.data.summary);
        setRecentSales(summaryResponse.data.recentSales);
        setTopProducts(summaryResponse.data.topProducts);
        setTrendData(trendResponse.data);
        setLowStock(lowStockResponse.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token, dateRange]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const revenueChartData = {
    labels: trendData.map((item) => item.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: trendData.map((item) => item.totalRevenue),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Revenue Trend' },
    },
  };

  const productChartData = {
    labels: topProducts.map((item) => item.product),
    datasets: [
      {
        label: 'Revenue ($)',
        data: topProducts.map((item) => item.totalRevenue),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Quantity Sold',
        data: topProducts.map((item) => item.totalQuantity),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const productChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top Products Performance' },
    },
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar setToken={setToken} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
                <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Date Range</h3>
                  <div className="flex space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
                    <p className="text-2xl font-bold text-blue-500">{summary.totalSales}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                    <p className="text-2xl font-bold text-blue-500">${summary.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Profit</h3>
                    <p className="text-2xl font-bold text-blue-500">${summary.totalProfit.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Trend</h3>
                    <Line data={revenueChartData} options={revenueChartOptions} />
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Products</h3>
                    <Bar data={productChartData} options={productChartOptions} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div className="space-y-4">
                      <Link
                        to="/dashboard/sales-form"
                        className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      >
                        Record Sale
                      </Link>
                      <Link
                        to="/dashboard/sales"
                        className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      >
                        View Sales
                      </Link>
                      <Link
                        to="/dashboard/analytics"
                        className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      >
                        View Analytics
                      </Link>
                      <Link
                        to="/dashboard/inventory-form"
                        className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      >
                        Manage Inventory
                      </Link>
                      <Link
                        to="/dashboard/inventory"
                        className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      >
                        View Inventory
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Low Stock Alerts</h3>
                    {lowStock.length > 0 ? (
                      <ul className="space-y-2">
                        {lowStock.map((item) => (
                          <li key={item.product} className="text-red-600">
                            {item.product}: {item.stock} units (below threshold of {item.lowStockThreshold})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No low stock alerts</p>
                    )}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Sales</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Product</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Total Price ($)</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSales.map((sale) => (
                          <tr key={sale._id} className="border-t">
                            <td className="p-3">{sale.product}</td>
                            <td className="p-3">{sale.quantity}</td>
                            <td className="p-3">{sale.totalPrice}</td>
                            <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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