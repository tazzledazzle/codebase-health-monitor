import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Repository } from '../../types';

interface AnalysisProgressProps {
    repository: Repository;
    progress: number;
    status?: 'analyzing' | 'completed' | 'error';
    message?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
                                                                      repository,
                                                                      progress,
                                                                      status = 'analyzing',
                                                                      message
                                                                  }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    {getStatusIcon()}
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                            {repository.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message || (status === 'analyzing' ? 'Analyzing codebase...' : 'Analysis complete')}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {progress}%
                    </div>
                    <div className="text-xs text-gray-500">
                        {status === 'analyzing' ? 'In Progress' :
                            status === 'completed' ? 'Completed' : 'Error'}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Status Message for Errors */}
            {status === 'error' && message && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                    {message}
                </div>
            )}
        </div>
    );
};