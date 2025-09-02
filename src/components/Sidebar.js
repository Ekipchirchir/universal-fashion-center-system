import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, ShoppingCartIcon, DocumentTextIcon, ChartBarIcon, CubeIcon, ArrowRightOnRectangleIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { ThemeContext } from '../ThemeContext';

const Sidebar = ({ setToken }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/dashboard/sales-form', label: 'Record Sale', icon: ShoppingCartIcon },
    { path: '/dashboard/sales', label: 'Sales Records', icon: DocumentTextIcon },
    { path: '/dashboard/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/dashboard/inventory-form', label: 'Manage Inventory', icon: CubeIcon },
    { path: '/dashboard/inventory', label: 'View Inventory', icon: CubeIcon },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    closed: { x: '-100%', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const textVariants = {
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    hidden: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  };

  const backdropVariants = {
    open: { opacity: 0.5, transition: { duration: 0.3 } },
    closed: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Sidebar for large screens */}
      <motion.div
        initial={{ width: 300 }}
        animate={{ width: 300 }}
        className="fixed top-0 left-0 h-full bg-gradient-to-b from-blue-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg z-50 hidden md:block w-[300px]"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <motion.h2
            variants={textVariants}
            animate="visible"
            className="text-2xl font-semibold tracking-tight"
          >
            Universal Fashion Center
          </motion.h2>
        </div>
        <nav className="space-y-2 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
              aria-label={item.label}
            >
              <item.icon className="w-6 h-6 mr-4 flex-shrink-0" />
              <motion.span
                variants={textVariants}
                animate="visible"
                className="text-base font-medium truncate"
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="flex items-center p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md w-full"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon className="w-6 h-6 mr-4 flex-shrink-0" /> : <SunIcon className="w-6 h-6 mr-4 flex-shrink-0" />}
            <motion.span
              variants={textVariants}
              animate="visible"
              className="text-base font-medium"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </motion.span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md w-full"
            aria-label="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 mr-4 flex-shrink-0" />
            <motion.span
              variants={textVariants}
              animate="visible"
              className="text-base font-medium"
            >
              Logout
            </motion.span>
          </button>
        </nav>
      </motion.div>

      {/* Sidebar for small screens */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 bg-black opacity-0 md:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg z-50 md:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-700">
                <motion.h2
                  variants={textVariants}
                  animate="visible"
                  className="text-2xl  font-semibold tracking-tight"
                >
                  Universal fashion center
                </motion.h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-blue-700 dark:hover:bg-gray-700 rounded"
                  aria-label="Close sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-2 px-4 py-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                    aria-label={item.label}
                  >
                    <item.icon className="w-6 h-6 mr-4 flex-shrink-0" />
                    <motion.span
                      variants={textVariants}
                      animate="visible"
                      className="text-base font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
                <button
                  onClick={toggleTheme}
                  className="flex items-center p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md w-full"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <MoonIcon className="w-6 h-6 mr-4 flex-shrink-0" /> : <SunIcon className="w-6 h-6 mr-4 flex-shrink-0" />}
                  <motion.span
                    variants={textVariants}
                    animate="visible"
                    className="text-base font-medium"
                  >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </motion.span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md w-full"
                  aria-label="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6 mr-4 flex-shrink-0" />
                  <motion.span
                    variants={textVariants}
                    animate="visible"
                    className="text-base font-medium"
                  >
                    Logout
                  </motion.span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hamburger menu icon for small screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 p-2 bg-blue-600 dark:bg-gray-700 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200 z-50"
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
};

export default Sidebar;
