import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SalesForm = ({ token }) => {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const products = [
    'Men Suits', 'Skirt Suit', 'Ladies Trouser Suit', 'Official Shoes',
    'Children Shoes', 'Bata School Shoes', 'Women Shoes', 'Trousers',
    'Dresses', 'Boys Suits', 'Dry Cleaning Service', 'Laundry Machine'
  ];

  // Fetch buying price when product changes
  useEffect(() => {
    if (product) {
      const fetchBuyingPrice = async () => {
        try {
          const response = await axios.get(`https://ufc.up.railway.app/api/inventory?search=${product}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const inventoryItem = response.data.data.find(item => item.product === product);
          if (inventoryItem) {
            setBuyingPrice(inventoryItem.buyingPrice.toString());
          } else {
            setBuyingPrice('');
            toast.error(`No inventory found for ${product}`);
          }
        } catch (err) {
          toast.error('Failed to fetch buying price');
          setBuyingPrice('');
        }
      };
      fetchBuyingPrice();
    } else {
      setBuyingPrice('');
    }
  }, [product, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !quantity || !sellingPrice) {
      toast.error('Product, quantity, and selling price are required');
      return;
    }
    if (quantity <= 0 || sellingPrice <= 0) {
      toast.error('Quantity and selling price must be positive');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'https://ufc.up.railway.app/api/sales',
        { product, quantity: Number(quantity), sellingPrice: Number(sellingPrice), buyingPrice: Number(buyingPrice) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Sale recorded successfully!');
      setProduct('');
      setQuantity('');
      setSellingPrice('');
      setBuyingPrice('');
      setTimeout(() => navigate('/dashboard/sales'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview values
  const totalRevenue = quantity && sellingPrice ? (Number(quantity) * Number(sellingPrice)).toFixed(2) : '0.00';
  const totalCost = quantity && buyingPrice ? (Number(quantity) * Number(buyingPrice)).toFixed(2) : '0.00';
  const profit = (Number(totalRevenue) - Number(totalCost)).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen"
    >
      <div className="card max-w-full sm:max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Record a Sale</h2>
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} aria-label="Sales form">
          <div>
            <label htmlFor="product" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Product</label>
            <select
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              aria-required="true"
              title="Select the product being sold"
            >
              <option value="">Select a product</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Quantity</label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter quantity (e.g., 5)"
              aria-required="true"
              title="Number of items sold"
            />
          </div>
          <div>
            <label htmlFor="sellingPrice" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Selling Price per Item (Kes)</label>
            <input
              id="sellingPrice"
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter selling price (e.g., 5000)"
              aria-required="true"
              title="Price you charge per item (e.g., 5000 Kes per suit)"
            />
          </div>
          <div>
            <label htmlFor="buyingPrice" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Buying Price per Item (Kes)</label>
            <input
              id="buyingPrice"
              type="number"
              step="0.01"
              value={buyingPrice}
              readOnly
              className="w-full p-2 sm:p-3 border rounded-lg bg-gray-200 dark:bg-gray-600 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Auto-filled from inventory"
              title="Cost you paid per item (auto-filled from inventory)"
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            <p><strong>Total Revenue:</strong> {totalRevenue} Kes (Quantity × Selling Price)</p>
            <p><strong>Total Cost:</strong> {totalCost} Kes (Quantity × Buying Price)</p>
            <p><strong>Profit:</strong> {profit} Kes (Revenue − Cost)</p>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-sm sm:text-base px-3 sm:px-4 py-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={loading ? 'Recording...' : 'Record Sale'}
          >
            {loading ? 'Recording...' : 'Record Sale'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default SalesForm;
