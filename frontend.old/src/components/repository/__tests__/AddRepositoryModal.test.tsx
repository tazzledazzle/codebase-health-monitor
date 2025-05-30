import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddRepositoryModal } from '../AddRepositoryModal';
import { Repository } from '../../../types';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AddRepositoryModal', () => {
    const mockOnClose = jest.fn();
    const mockOnRepositoryAdded = jest.fn();

    beforeEach(() => {
        mockFetch.mockClear();
        mockOnClose.mockClear();
        mockOnRepositoryAdded.mockClear();
    });

    it('renders modal with git and upload tabs', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        expect(screen.getByText('Add Repository')).toBeInTheDocument();
        expect(screen.getByText('Git Repository')).toBeInTheDocument();
        expect(screen.getByText('Upload ZIP')).toBeInTheDocument();
    });

    it('shows git form by default', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        expect(screen.getByPlaceholderText('My Awesome Project')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('https://github.com/username/repo.git')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ghp_xxxxxxxxxxxx')).toBeInTheDocument();
    });

    it('switches to upload form when upload tab is clicked', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        fireEvent.click(screen.getByText('Upload ZIP'));

        expect(screen.getByText('Click to upload ZIP file')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('My Project')).toBeInTheDocument();
    });

    it('validates git URL input', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        const urlInput = screen.getByPlaceholderText('https://github.com/username/repo.git');
        fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

        expect(screen.getByText('Please enter a valid Git repository URL')).toBeInTheDocument();
    });

    it('submits git form with correct data', async () => {
        const mockRepository: Repository = {
            id: '1',
            name: 'Test Repo',
            url: 'https://github.com/test/repo.git',
            stats: {
                files: 0,
                classes: 0,
                functions: 0,
                errors: 0,
                churn: 0,
                docCoverage: 0
            },
            lastUpdated: '2025-05-30T12:00:00Z'
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockRepository,
        } as Response);

        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Fill out form
        fireEvent.change(screen.getByPlaceholderText('My Awesome Project'), {
            target: { value: 'Test Repo' }
        });
        fireEvent.change(screen.getByPlaceholderText('https://github.com/username/repo.git'), {
            target: { value: 'https://github.com/test/repo.git' }
        });
        fireEvent.change(screen.getByPlaceholderText('ghp_xxxxxxxxxxxx'), {
            target: { value: 'token123' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /add repository/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/repos/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'git',
                    name: 'Test Repo',
                    url: 'https://github.com/test/repo.git',
                    accessToken: 'token123'
                })
            });
        });

        await waitFor(() => {
            expect(mockOnRepositoryAdded).toHaveBeenCalledWith(mockRepository);
        });
    });

    it('handles git form submission errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Repository not found' }),
        } as Response);

        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Fill out form
        fireEvent.change(screen.getByPlaceholderText('My Awesome Project'), {
            target: { value: 'Test Repo' }
        });
        fireEvent.change(screen.getByPlaceholderText('https://github.com/username/repo.git'), {
            target: { value: 'https://github.com/test/nonexistent.git' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /add repository/i }));

        await waitFor(() => {
            expect(screen.getByText('Repository not found')).toBeInTheDocument();
        });
    });

    it('handles file upload correctly', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Switch to upload tab
        fireEvent.click(screen.getByText('Upload ZIP'));

        // Create a mock file
        const file = new File(['test content'], 'test-repo.zip', { type: 'application/zip' });

        // Get the hidden file input
        const fileInput = screen.getByRole('button', { name: /upload repository/i })
            .closest('form')
            ?.querySelector('input[type="file"]') as HTMLInputElement;

        // Simulate file selection
        Object.defineProperty(fileInput, 'files', {
            value: [file],
            writable: false,
        });

        fireEvent.change(fileInput);

        // Check that file name is displayed
        expect(screen.getByText('test-repo.zip')).toBeInTheDocument();
    });

    it('disables submit button when form is incomplete', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        const submitButton = screen.getByRole('button', { name: /add repository/i });
        expect(submitButton).toBeDisabled();

        // Fill name only
        fireEvent.change(screen.getByPlaceholderText('My Awesome Project'), {
            target: { value: 'Test' }
        });
        expect(submitButton).toBeDisabled();

        // Fill URL too
        fireEvent.change(screen.getByPlaceholderText('https://github.com/username/repo.git'), {
            target: { value: 'https://github.com/test/repo.git' }
        });
        expect(submitButton).not.toBeDisabled();
    });

    it('closes modal when close button is clicked', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        const closeButton = screen.getByRole('button', { name: '' }); // X button
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during submission', async () => {
        // Mock a delayed response
        mockFetch.mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({
                ok: true,
                json: async () => ({}),
            } as Response), 100))
        );

        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('My Awesome Project'), {
            target: { value: 'Test' }
        });
        fireEvent.change(screen.getByPlaceholderText('https://github.com/username/repo.git'), {
            target: { value: 'https://github.com/test/repo.git' }
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /add repository/i }));

        // Check loading state
        expect(screen.getByText('Adding Repository...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /adding repository/i })).toBeDisabled();
    });
});