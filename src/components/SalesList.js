import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesList = ({ token }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSales(response.data);
      } catch (err) {
        console.error('Failed to fetch sales:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [token]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Records</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Unit Price ($)</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Cost Price ($)</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Total Price ($)</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id} className="border-t">
                <td className="p-3">{sale.product}</td>
                <td className="p-3">{sale.quantity}</td>
                <td className="p-3">{sale.unitPrice}</td>
                <td className="p-3">{sale.costPrice}</td>
                <td className="p-3">{sale.totalPrice}</td>
                <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesList;