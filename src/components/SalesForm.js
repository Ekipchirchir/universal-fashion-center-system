import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SalesForm = ({ token }) => {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const products = [
    'Men Suits', 'Skirt Suit', 'Ladies Trouser Suit', 'Official Shoes',
    'Children Shoes', 'Bata School Shoes', 'Women Shoes', 'Trousers',
    'Dresses', 'Boys Suits', 'Dry Cleaning Service', 'Laundry Machine'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !quantity || !unitPrice || !costPrice) {
      toast.error('Please fill in all fields');
      return;
    }
    if (quantity <= 0 || unitPrice <= 0 || costPrice < 0) {
      toast.error('Quantity and unit price must be positive, cost price cannot be negative');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/sales',
        { product, quantity: Number(quantity), unitPrice: Number(unitPrice), costPrice: Number(costPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Sale recorded successfully!');
      setProduct('');
      setQuantity('');
      setUnitPrice('');
      setCostPrice('');
      setTimeout(() => navigate('/dashboard/sales'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Record Sale</h2>
      <form className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product</option>
            {products.map((prod) => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quantity"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Price ($)</label>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter unit price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price ($)</label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter cost price"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-semibold ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Recording...' : 'Record Sale'}
        </button>
      </form>
    </div>
  );
};

export default SalesForm;