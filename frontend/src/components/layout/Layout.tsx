import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAppStore } from '../../store';

const Layout: React.FC = () => {
  const { isDarkMode } = useAppStore();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <Navbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;