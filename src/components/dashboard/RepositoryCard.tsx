import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitFork, Calendar, Book, FileCode, AlertTriangle } from 'lucide-react';
import { Repository } from '../../types';
import { useAppStore } from '../../store';

interface RepositoryCardProps {
  repository: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const navigate = useNavigate();
  const { setCurrentRepository } = useAppStore();
  
  const handleClick = () => {
    setCurrentRepository(repository);
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:translate-y-[-2px]"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <GitFork className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
            {repository.name}
          </h3>
        </div>
        
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
          {repository.url}
        </p>
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <FileCode className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {repository.stats.files}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Files</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {repository.stats.errors}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Errors</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <Book className="h-4 w-4 text-green-500" />
            <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {repository.stats.docCoverage}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Doc</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Updated: {formatDate(repository.lastUpdated)}
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;