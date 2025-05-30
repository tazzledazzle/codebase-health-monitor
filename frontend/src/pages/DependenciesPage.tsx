import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Network } from 'lucide-react';
import { useAppStore } from '../store';
import DependencyGraph from '../components/visualization/DependencyGraph';
import DocumentationPanel from '../components/documentation/DocumentationPanel';

const DependenciesPage: React.FC = () => {
  const { 
    currentRepository, 
    repositories, 
    graphData, 
    selectedNode, 
    documentation,
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

  const selectedDoc = selectedNode ? documentation[selectedNode.id] : null;

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
          <Network className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          Dependency Graph: {currentRepository.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize relationships between components in your codebase. Click on nodes to see details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DependencyGraph data={graphData} height={700} />
        </div>
        <div>
          <DocumentationPanel documentation={selectedDoc} />
        </div>
      </div>
    </div>
  );
};

export default DependenciesPage;