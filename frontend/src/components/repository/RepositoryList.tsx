import React from 'react';
import {Repository, RepositoryStatus} from '../../types';
import {Calendar, FileText, Users, TrendingUp, AlertTriangle} from 'lucide-react';

interface RepositoryListProps {
    repositories: Repository[];
    currentRepository: Repository | null;
    onSelectRepository: (repository: Repository) => void;
    getStatusIcon: (status: RepositoryStatus) => React.ReactNode;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
                                                                  repositories,
                                                                  currentRepository,
                                                                  onSelectRepository,
                                                                  getStatusIcon
                                                              }) => {
    if (repositories.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No repositories yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Add your first repository to start monitoring codebase health
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Repositories ({repositories.length})
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {repositories.map((repository) => (
                    <RepositoryCard
                        key={repository.id}
                        repository={repository}
                        isSelected={currentRepository?.id === repository.id}
                        onSelect={() => onSelectRepository(repository)}
                        statusIcon={getStatusIcon(repository.status)}
                    />
                ))}
            </div>
        </div>
    );
};

interface RepositoryCardProps {
    repository: Repository;
    isSelected: boolean;
    onSelect: () => void;
    statusIcon: React.ReactNode;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
                                                           repository,
                                                           isSelected,
                                                           onSelect,
                                                           statusIcon
                                                       }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getHealthScore = () => {
        const {stats} = repository;
        if (!stats) return 0;

        // Simple health calculation based on errors and doc coverage
        const errorPenalty = Math.min(stats.errors * 2, 50);
        const docBonus = stats.docCoverage * 0.5;
        return Math.max(0, Math.min(100, 100 - errorPenalty + docBonus));
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const healthScore = getHealthScore();

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {repository.name}
                        </h3>
                        {repository.url && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {repository.url}
                            </p>
                        )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                        {statusIcon}
                    </div>
                </div>

                {/* Stats */}
                {repository.stats && (
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-2"/>
                                <span className="text-gray-600 dark:text-gray-400">
                  {repository.stats.files} files
                </span>
                            </div>
                            <div className="flex items-center">
                                <Users className="w-4 h-4 text-gray-400 mr-2"/>
                                <span className="text-gray-600 dark:text-gray-400">
                  {repository.stats.functions} functions
                </span>
                            </div>
                        </div>

                        {/* Health Score */}
                        <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Health Score
              </span>
                            <span className={`text-sm font-medium ${getHealthColor(healthScore)}`}>
                {healthScore}%
              </span>
                        </div>

                        {/* Errors */}
                        {repository.stats.errors > 0 && (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-4 h-4 mr-2"/>
                                <span className="text-sm">
                  {repository.stats.errors} error{repository.stats.errors !== 1 ? 's' : ''}
                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1"/>
                    Updated {formatDate(repository.lastUpdated)}
                </div>
            </div>
        </div>
    );
};