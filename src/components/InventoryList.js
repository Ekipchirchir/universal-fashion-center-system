import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const InventoryList = ({ token }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('product');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(response.data);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        toast.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [token]);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const sortedInventory = [...inventory]
    .filter((item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === 'product') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory List</h2>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name..."
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('product')}
              >
                Product {sortField === 'product' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('stock')}
              >
                Stock {sortField === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort('lowStockThreshold')}
              >
                Threshold {sortField === 'lowStockThreshold' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedInventory.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="p-3">{item.product}</td>
                <td className="p-3">{item.stock}</td>
                <td className="p-3">{item.lowStockThreshold}</td>
                <td className="p-3">
                  {item.stock <= item.lowStockThreshold ? (
                    <span className="text-red-600">Low</span>
                  ) : (
                    <span className="text-green-600">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedInventory.length === 0 && (
        <p className="text-gray-600 text-center mt-4">No inventory items found</p>
      )}
    </div>
  );
};

export default InventoryList;