import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SalesList = ({ token }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['sales', token, page, searchTerm],
    queryFn: async () => {
      const response = await axios.get('https://ufc.up.railway.app/api/sales', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: itemsPerPage, search: searchTerm },
      });
      return response.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to load sales data');
    },
  });

  const totalPages = Math.ceil((sales?.total || 0) / itemsPerPage);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg bg-gray-100 dark:bg-gray-900 min-h-screen"
      >
        Loading sales data...
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
        Error loading sales data. Please try again later.
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Sales Records</h2>
        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name..."
            className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
            aria-label="Search sales by product name"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Product</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Quantity</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Selling Price (Kes)</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Buying Price (Kes)</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Total Revenue (Kes)</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Profit (Kes)</th>
                <th className="table-header text-xs sm:text-sm px-2 sm:px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales?.data && sales.data.length > 0 ? (
                sales.data.map((sale) => (
                  <tr key={sale._id} className="table-row hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{sale.product}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{sale.quantity}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{sale.sellingPrice != null ? sale.sellingPrice.toFixed(2) : '0.00'}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{sale.buyingPrice != null ? sale.buyingPrice.toFixed(2) : '0.00'}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{sale.totalPrice != null ? sale.totalPrice.toFixed(2) : '0.00'}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">
                      {(sale.sellingPrice != null && sale.buyingPrice != null
                        ? sale.quantity * (sale.sellingPrice - sale.buyingPrice)
                        : 0).toFixed(2)}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-2 sm:px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    No sales records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default SalesList;
