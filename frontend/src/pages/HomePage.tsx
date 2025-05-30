import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, GitFork, BarChart, Zap } from 'lucide-react';
import { useAppStore } from '../store';

const HomePage: React.FC = () => {
  const { fetchRepositories } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return (
    <div className="pt-8 pb-16">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
          <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Codebase Health Explorer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Visualize, document, and monitor your codebase instantly
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/repositories')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Explore Repositories
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 transform hover:-translate-y-0.5"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <div className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <GitFork className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Dependency Visualization
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Interactive graph visualization showing relationships between code components
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <div className="inline-block p-3 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <BarChart className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Hotspots
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Identify error-prone areas of your codebase to prioritize improvements
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <div className="inline-block p-3 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
            <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AI Documentation
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Automatically generated documentation for classes, functions, and modules
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;