import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { PencilIcon } from '@heroicons/react/24/outline';

const InventoryList = ({ token }) => {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('product');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', token, page, sortField, sortOrder, searchTerm],
    queryFn: async () => {
      const response = await axios.get('https://ufc.up.railway.app/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: itemsPerPage, sortBy: sortField, sortOrder, search: searchTerm },
      });
      return response.data;
    },
    onError: () => {
      toast.error('Failed to load inventory data');
    },
  });

  const totalPages = Math.ceil((inventoryData?.total || 0) / itemsPerPage);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Inventory List</h2>
        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name..."
            className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
            aria-label="Search inventory by product name"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="table-header">
              <tr>
                <th
                  className="table-header cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2"
                  onClick={() => handleSort('product')}
                  aria-label="Sort by product"
                >
                  Product {sortField === 'product' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="table-header cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2"
                  onClick={() => handleSort('stock')}
                  aria-label="Sort by stock"
                >
                  Stock {sortField === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="table-header cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2"
                  onClick={() => handleSort('buyingPrice')}
                  aria-label="Sort by buying price"
                >
                  Buying Price (Kes) {sortField === 'buyingPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="table-header cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2"
                  onClick={() => handleSort('lowStockThreshold')}
                  aria-label="Sort by low stock threshold"
                >
                  Threshold {sortField === 'lowStockThreshold' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Status</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData?.data.map((item) => (
                <tr key={item._id} className="table-row hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.product}</td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.stock}</td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.buyingPrice != null ? item.buyingPrice.toFixed(2) : '0.00'}</td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.lowStockThreshold}</td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">
                    {item.stock <= item.lowStockThreshold ? (
                      <span className="text-red-600 dark:text-red-400">Low</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">OK</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">
                    <Link
                      to="/dashboard/inventory-form"
                      state={{ product: item.product, stock: item.stock, buyingPrice: item.buyingPrice || 0, lowStockThreshold: item.lowStockThreshold }}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label={`Edit inventory for ${item.product}`}
                    >
                      <PencilIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {inventoryData?.data.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-center mt-4 text-xs sm:text-sm">No inventory items found</p>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 space-y-3 sm:space-y-0">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn-primary disabled:opacity-50 text-xs sm:text-sm px-3 sm:px-4 py-2"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-primary disabled:opacity-50 text-xs sm:text-sm px-3 sm:px-4 py-2"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryList;
