import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilesIcon, GitBranch, AlertTriangle, Gauge, BookOpen, BarChart, History } from 'lucide-react';
import { useAppStore } from '../store';
import StatCard from '../components/dashboard/StatCard';
import DependencyGraph from '../components/visualization/DependencyGraph';
import DocumentationPanel from '../components/documentation/DocumentationPanel';
import ErrorList from '../components/hotspot/ErrorList';
import { mockErrors } from '../data/mockData';

const DashboardPage: React.FC = () => {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {currentRepository.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentRepository.url}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Files" 
          value={currentRepository.stats.files} 
          icon={FilesIcon}
        />
        <StatCard 
          title="Classes" 
          value={currentRepository.stats.classes} 
          icon={Gauge}
        />
        <StatCard 
          title="Errors" 
          value={currentRepository.stats.errors} 
          icon={AlertTriangle}
          trend={12}
          trendLabel="last 7 days"
        />
        <StatCard 
          title="Doc Coverage" 
          value={`${currentRepository.stats.docCoverage}%`} 
          icon={BookOpen}
          trend={-5}
          trendLabel="last 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <DependencyGraph data={graphData} height={500} />
        </div>
        <div>
          <DocumentationPanel documentation={selectedDoc} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ErrorList errors={mockErrors} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <History className="h-5 w-5 text-blue-500 mr-2" />
              High Churn Files
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {graphData.nodes
                .sort((a, b) => b.churn - a.churn)
                .slice(0, 5)
                .map(node => (
                  <div key={node.id} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {node.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {node.churn} changes
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(node.churn / 35) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;