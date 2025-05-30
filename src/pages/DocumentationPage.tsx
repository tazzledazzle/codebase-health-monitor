import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, BookOpen, Search, Code, Package, FunctionSquare as FunctionIcon } from 'lucide-react';
import { useAppStore } from '../store';
import DocumentationPanel from '../components/documentation/DocumentationPanel';
import { mockDocumentation } from '../data/mockData';
import { Documentation } from '../types';

const DocumentationPage: React.FC = () => {
  const { 
    currentRepository, 
    repositories,
    fetchRepositories, 
    fetchGraphData, 
    setCurrentRepository 
  } = useAppStore();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [filteredDocs, setFilteredDocs] = useState<Documentation[]>([]);

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

  useEffect(() => {
    // Convert documentation object to array for filtering
    const docsArray = Object.values(mockDocumentation);
    setFilteredDocs(
      searchTerm 
        ? docsArray.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : docsArray
    );
  }, [searchTerm]);

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

  const selectedDoc = selectedDocId ? mockDocumentation[selectedDocId] : null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'class':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'function':
        return <FunctionIcon className="h-4 w-4 text-green-500" />;
      case 'module':
        return <BookOpen className="h-4 w-4 text-orange-500" />;
      default:
        return <Code className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
          <BookOpen className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
          Documentation: {currentRepository.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-generated documentation for components in your codebase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocs.map((doc) => (
                  <li key={doc.id}>
                    <button
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedDocId === doc.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                      onClick={() => setSelectedDocId(doc.id)}
                    >
                      <div className="flex items-center">
                        {getTypeIcon(doc.type)}
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {doc.name}
                        </span>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {doc.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                        {doc.description}
                      </p>
                    </button>
                  </li>
                ))}
                {filteredDocs.length === 0 && (
                  <li className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No documentation found for "{searchTerm}"
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <DocumentationPanel documentation={selectedDoc} />
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;