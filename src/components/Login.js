import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('https://ufc.up.railway.app/api/auth/login', {
        username,
        password,
      });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-[90%] sm:max-w-md p-4 sm:p-6 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 relative z-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4 sm:mb-8">Universal Fashion Center</h2>
        <form className="space-y-4 sm:space-y-6" onSubmit={handleLogin} aria-label="Login form">
          <div>
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter username"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-sm sm:text-base"
              placeholder="Enter password"
              aria-required="true"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-sm sm:text-base px-3 sm:px-4 py-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={loading ? 'Logging in...' : 'Login'}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
