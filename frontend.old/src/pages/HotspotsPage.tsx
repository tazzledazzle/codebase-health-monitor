import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store';
import DependencyGraph from '../components/visualization/DependencyGraph';
import ErrorList from '../components/hotspot/ErrorList';
import { mockErrors } from '../data/mockData';

const HotspotsPage: React.FC = () => {
  const { 
    currentRepository, 
    repositories, 
    graphData,
    fetchRepositories, 
    fetchGraphData, 
    setCurrentRepository 
  } = useAppStore();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (repositories.length === 0) {
      fetchRepositories();
    }
  }, [repositories.length, fetchRepositories]);

  useEffect(() => {
    if (!currentRepository && repositories.length > 0) {
      setCurrentRepository(repositories[0]);
    }
  }, [currentRepository, repositories, setCurrentRepository]);

  useEffect(() => {
    if (currentRepository) {
      fetchGraphData(currentRepository.id);
    }
  }, [currentRepository, fetchGraphData]);

  if (!currentRepository) {
    return (
      <div className="py-8 text-center">
        <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No repository selected
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please select a repository to continue.
        </p>
        <button 
          onClick={() => navigate('/repositories')} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          Select Repository
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-500" />
          Error Hotspots: {currentRepository.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Identify error-prone areas in your codebase to prioritize improvements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DependencyGraph data={graphData} height={500} />
        </div>
        <div>
          <ErrorList errors={mockErrors} />
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Error Statistics
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Errors by Component Type
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Controllers</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Services</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Models</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Utils</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Error Types
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Null Pointer</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Timeout</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Authentication</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">18%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Other</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotsPage;