import React, { useState, useRef } from 'react';
import { X, Github, Upload, AlertCircle, Loader } from 'lucide-react';
import { Repository } from '../../types';

interface AddRepositoryModalProps {
    onClose: () => void;
    onRepositoryAdded: (repository: Repository) => void;
}

export const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
                                                                          onClose,
                                                                          onRepositoryAdded
                                                                      }) => {
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
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Add Repository
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('git')}
                        className={`flex-1 py-3 px-