import React, { useEffect } from 'react';
import { GitFork, Plus } from 'lucide-react';
import { useAppStore } from '../store';
import RepositoryCard from '../components/dashboard/RepositoryCard';

const RepositoriesPage: React.FC = () => {
  const { repositories, fetchRepositories } = useAppStore();

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <GitFork className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          Repositories
        </h1>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Add Repository
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 text-center">
          <GitFork className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No repositories yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect a GitHub repository or upload a codebase to get started.
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
            Add Your First Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map(repo => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositoriesPage;