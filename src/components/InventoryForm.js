import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const InventoryForm = ({ token }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState('');
  const [stock, setStock] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [loading, setLoading] = useState(false);

  const products = [
    'Men Suits', 'Skirt Suit', 'Ladies Trouser Suit', 'Official Shoes',
    'Children Shoes', 'Bata School Shoes', 'Women Shoes', 'Trousers',
    'Dresses', 'Boys Suits', 'Dry Cleaning Service', 'Laundry Machine'
  ];

  useEffect(() => {
    if (location.state) {
      setProduct(location.state.product || '');
      setStock(location.state.stock?.toString() || '');
      setBuyingPrice(location.state.buyingPrice?.toString() || '');
      setLowStockThreshold(location.state.lowStockThreshold?.toString() || '10');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !stock || !buyingPrice || !lowStockThreshold) {
      toast.error('Please fill in all fields');
      return;
    }
    if (stock < 0 || buyingPrice < 0 || lowStockThreshold < 0) {
      toast.error('Stock, buying price, and low stock threshold cannot be negative');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'https://ufc.up.railway.app/api/inventory',
        { product, stock: Number(stock), buyingPrice: Number(buyingPrice), lowStockThreshold: Number(lowStockThreshold) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Inventory updated successfully!');
      setProduct('');
      setStock('');
      setBuyingPrice('');
      setLowStockThreshold('10');
      setTimeout(() => navigate('/dashboard/inventory'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen"
    >
      <div className="card max-w-full sm:max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Add/Update Stock</h2>
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} aria-label="Inventory form">
          <div>
            <label htmlFor="product" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Product</label>
            <select
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              aria-required="true"
              title="Select the product for new stock"
            >
              <option value="">Select a product</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="stock" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Stock Quantity</label>
            <input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter stock quantity (e.g., 10)"
              aria-required="true"
              title="Number of items received"
            />
          </div>
          <div>
            <label htmlFor="buyingPrice" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Buying Price per Item (Kes)</label>
            <input
              id="buyingPrice"
              type="number"
              step="0.01"
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter buying price (e.g., 3000)"
              aria-required="true"
              title="Cost you paid per item (e.g., 3000 Kes per suit, or 0 for services)"
            />
          </div>
          <div>
            <label htmlFor="lowStockThreshold" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Low Stock Threshold</label>
            <input
              id="lowStockThreshold"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter low stock threshold (e.g., 10)"
              aria-required="true"
              title="Alert when stock falls to this number"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-sm sm:text-base px-3 sm:px-4 py-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={loading ? 'Submitting...' : 'Submit'}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default InventoryForm;
