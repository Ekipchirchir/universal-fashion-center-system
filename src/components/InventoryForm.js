import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const InventoryForm = ({ token }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [loading, setLoading] = useState(false);

  const products = [
    'Men Suits', 'Skirt Suit', 'Ladies Trouser Suit', 'Official Shoes',
    'Children Shoes', 'Bata School Shoes', 'Women Shoes', 'Trousers',
    'Dresses', 'Boys Suits', 'Dry Cleaning Service', 'Laundry Machine'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !stock || !lowStockThreshold) {
      toast.error('Please fill in all fields');
      return;
    }
    if (stock < 0 || lowStockThreshold < 0) {
      toast.error('Stock and low stock threshold cannot be negative');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/inventory',
        { product, stock: Number(stock), lowStockThreshold: Number(lowStockThreshold) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Inventory updated successfully!');
      setProduct('');
      setStock('');
      setLowStockThreshold('10');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add/Update Inventory</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Product</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select a product</option>
            {products.map((prod) => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter stock quantity"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter low stock threshold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default InventoryForm;