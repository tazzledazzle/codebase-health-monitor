import React from 'react';
import { AlertTriangle, Clock, FileCode } from 'lucide-react';
import { ErrorData } from '../../types';
import { useAppStore } from '../../store';

interface ErrorListProps {
  errors: ErrorData[];
}

const ErrorList: React.FC<ErrorListProps> = ({ errors }) => {
  const { graphData, setSelectedNode } = useAppStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileClick = (fileId: string) => {
    const node = graphData.nodes.find(node => node.id === fileId);
    if (node) {
      setSelectedNode(node);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          Recent Errors
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total: {errors.length}
        </span>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {errors.map(error => (
          <div key={error.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{error.message}</h4>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                {error.count}×
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>Last occurred: {formatDate(error.lastOccurred)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {error.relatedFiles.map(fileId => (
                <button
                  key={fileId}
                  onClick={() => handleFileClick(fileId)}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <FileCode className="h-3 w-3 mr-1" />
                  {graphData.nodes.find(node => node.id === fileId)?.name || fileId}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorList;