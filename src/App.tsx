import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import RepositoriesPage from './pages/RepositoriesPage';
import DashboardPage from './pages/DashboardPage';
import DependenciesPage from './pages/DependenciesPage';
import HotspotsPage from './pages/HotspotsPage';
import DocumentationPage from './pages/DocumentationPage';
import { useAppStore } from './store';

function App() {
  const { isDarkMode } = useAppStore();

  // Apply dark mode to the document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="repositories" element={<RepositoriesPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dependencies" element={<DependenciesPage />} />
          <Route path="hotspots" element={<HotspotsPage />} />
          <Route path="documentation" element={<DocumentationPage />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;