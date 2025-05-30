import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Repository } from '../../types';

interface AnalysisProgressProps {
    repository: Repository;
    progress: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
                                                                      repository,
                                                                      progress
                                                                  }) => {
    const getProgressColor = (progress: number) => {
        if (progress < 30) return 'bg-red-500';
        if (progress < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getProgressMessage = (progress: number) => {
        if (progress < 10) return 'Initializing analysis...';
        if (progress < 30) return 'Discovering code files...';
        if (progress < 60) return 'Analyzing file structure...';
        if (progress < 80) return 'Building dependency graph...';
        if (progress < 95) return 'Calculating metrics...';
        return 'Finalizing analysis...';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                            {repository.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Analysis in progress
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {progress}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Complete
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{getProgressMessage(progress)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Status Indicators */}
            <div className="flex space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                    {progress > 10 ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">Files discovered</span>
                </div>
                <div className="flex items-center space-x-1">
                    {progress > 60 ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">Analysis complete</span>
                </div>
                <div className="flex items-center space-x-1">
                    {progress > 90 ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">Graph generated</span>
                </div>
            </div>
        </div>
    );
};