import React, {useState, useEffect} from 'react';
import {Plus, Upload, Github, AlertCircle, CheckCircle, Clock, X} from 'lucide-react';
import {useAppStore} from '../../store';
import {Repository, RepositoryStatus} from '../../types';
import {RepositoryList} from './RepositoryList';
import {AddRepositoryModal} from './AddRepositoryModal';
import {AnalysisProgress} from './AnalysisProgress';

export const RepositoryManager: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState<Map<string, number>>(new Map());

    const {
        repositories,
        fetchRepositories,
        currentRepository,
        setCurrentRepository
    } = useAppStore();

    useEffect(() => {
        fetchRepositories();
    }, [fetchRepositories]);

    const handleRepositoryAdded = (repository: Repository) => {
        setShowAddModal(false);
        // Start monitoring analysis progress
        monitorAnalysisProgress(repository.id);
    };

    const monitorAnalysisProgress = (repositoryId: string) => {
        // Connect to WebSocket for real-time progress updates
        const ws = new WebSocket(`ws://localhost:8080/api/repos/${repositoryId}/progress`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setAnalysisProgress(prev => new Map(prev.set(repositoryId, data.progress)));

            if (data.status === 'completed') {
                ws.close();
                setAnalysisProgress(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(repositoryId);
                    return newMap;
                });
                // Refresh repositories to get updated status
                fetchRepositories();
            }
        };

        ws.onerror = () => {
            ws.close();
            setAnalysisProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(repositoryId);
                return newMap;
            });
        };
    };

    const getStatusIcon = (status: RepositoryStatus) => {
        switch (status) {
            case RepositoryStatus.READY:
                return <CheckCircle className="w-5 h-5 text-green-500"/>;
            case RepositoryStatus.ANALYZING:
                return <Clock className="w-5 h-5 text-blue-500 animate-spin"/>;
            case RepositoryStatus.ERROR:
                return <AlertCircle className="w-5 h-5 text-red-500"/>;
            default:
                return <Clock className="w-5 h-5 text-gray-500"/>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Repository Manager
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Connect repositories and monitor codebase health
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5"/>
                    <span>Add Repository</span>
                </button>
            </div>

            {/* Analysis Progress Cards */}
            {analysisProgress.size > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Analysis in Progress
                    </h2>
                    {Array.from(analysisProgress.entries()).map(([repoId, progress]) => {
                        const repository = repositories.find(r => r.id === repoId);
                        return repository ? (
                            <AnalysisProgress
                                key={repoId}
                                repository={repository}
                                progress={progress}
                            />
                        ) : null;
                    })}
                </div>
            )}

            {/* Repository List */}
            <RepositoryList
                repositories={repositories}
                currentRepository={currentRepository}
                onSelectRepository={setCurrentRepository}
                getStatusIcon={getStatusIcon}
            />

            {/* Add Repository Modal */}
            {showAddModal && (
                <AddRepositoryModal
                    onClose={() => setShowAddModal(false)}
                    onRepositoryAdded={handleRepositoryAdded}
                />
            )}
        </div>
    );
};