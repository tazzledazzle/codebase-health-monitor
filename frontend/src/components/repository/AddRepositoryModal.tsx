import React, {useState, useRef} from 'react';
import {X, Github, Upload, AlertCircle, Loader} from 'lucide-react';
import {Repository} from '../../types';

interface AddRepositoryModalProps {
    onClose: () => void;
    onRepositoryAdded: (repository: Repository) => void;
}

export const AddRepositoryModal: React.FC<AddRepositoryModalProps> =
    ({onClose, onRepositoryAdded}) => {
        const [activeTab, setActiveTab] = useState<'git' | 'upload'>('git');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        // Git form state
        const [gitUrl, setGitUrl] = useState('');
        const [repoName, setRepoName] = useState('');
        const [accessToken, setAccessToken] = useState('');

        // Upload form state
        const [uploadName, setUploadName] = useState('');
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleGitSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/repos/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'git',
                        name: repoName,
                        url: gitUrl,
                        accessToken: accessToken || undefined
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add repository');
                }

                const repository = await response.json();
                onRepositoryAdded(repository);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        const handleUploadSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedFile) return;

            setLoading(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('name', uploadName);

                const response = await fetch('/api/repos/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to upload repository');
                }

                const repository = await response.json();
                onRepositoryAdded(repository);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setSelectedFile(file);
                if (!uploadName) {
                    // Auto-generate name from filename
                    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                    setUploadName(nameWithoutExt);
                }
            }
        };

        const validateGitUrl = (url: string): boolean => {
            const gitUrlPattern = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/.+\.git$/;
            return gitUrlPattern.test(url) || url.includes('github.com') || url.includes('gitlab.com');
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                    {/* Header */}
                    <div
                        className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Add Repository
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('git')}
                            className={`flex-1 py-3 px-4 text-center ${
                                activeTab === 'git'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Github className="w-4 h-4 inline mr-2"/>
                            Git Repository
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 py-3 px-4 text-center ${
                                activeTab === 'upload'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2"/>
                            Upload ZIP
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                <AlertCircle className="w-4 h-4 inline mr-2"/>
                                {error}
                            </div>
                        )}

                        {activeTab === 'git' && (
                            <form onSubmit={handleGitSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Repository Name
                                    </label>
                                    <input
                                        type="text"
                                        value={repoName}
                                        onChange={(e) => setRepoName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., My Project"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Git URL
                                    </label>
                                    <input
                                        type="url"
                                        value={gitUrl}
                                        onChange={(e) => setGitUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://github.com/user/repo.git"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Access Token (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={accessToken}
                                        onChange={(e) => setAccessToken(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="For private repositories"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Required for private repositories
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !repoName || !gitUrl}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <Loader className="w-4 h-4 animate-spin mr-2"/>
                                    ) : (
                                        <Github className="w-4 h-4 mr-2"/>
                                    )}
                                    {loading ? 'Adding Repository...' : 'Add Repository'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'upload' && (
                            <form onSubmit={handleUploadSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadName}
                                        onChange={(e) => setUploadName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., My Project"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ZIP File
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                    >
                                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
                                        {selectedFile ? (
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Click to select ZIP file
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Max size: 100MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".zip"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !uploadName || !selectedFile}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <Loader className="w-4 h-4 animate-spin mr-2"/>
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2"/>
                                    )}
                                    {loading ? 'Uploading...' : 'Upload Repository'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    };