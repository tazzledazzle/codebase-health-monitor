import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddRepositoryModal } from '../AddRepositoryModal';

// Mock fetch
global.fetch = jest.fn();

describe('AddRepositoryModal', () => {
    const mockOnClose = jest.fn();
    const mockOnRepositoryAdded = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders modal with git tab active by default', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        expect(screen.getByText('Add Repository')).toBeInTheDocument();
        expect(screen.getByText('Git Repository')).toBeInTheDocument();
        expect(screen.getByText('Upload ZIP')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g., My Project')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('https://github.com/user/repo.git')).toBeInTheDocument();
    });

    it('switches between tabs correctly', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Switch to upload tab
        fireEvent.click(screen.getByText('Upload ZIP'));

        expect(screen.getByText('Project Name')).toBeInTheDocument();
        expect(screen.getByText('ZIP File')).toBeInTheDocument();
        expect(screen.getByText('Click to select ZIP file')).toBeInTheDocument();

        // Switch back to git tab
        fireEvent.click(screen.getByText('Git Repository'));

        expect(screen.getByText('Repository Name')).toBeInTheDocument();
        expect(screen.getByText('Git URL')).toBeInTheDocument();
    });

    it('submits git repository form successfully', async () => {
        const mockRepository = {
            id: '1',
            name: 'Test Repo',
            url: 'https://github.com/test/repo.git'
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRepository)
        });

        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Fill out form
        fireEvent.change(screen.getByPlaceholderText('e.g., My Project'), {
            target: { value: 'Test Repo' }
        });
        fireEvent.change(screen.getByPlaceholderText('https://github.com/user/repo.git'), {
            target: { value: 'https://github.com/test/repo.git' }
        });

        // Submit form
        fireEvent.click(screen.getByText('Add Repository'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/repos/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'git',
                    name: 'Test Repo',
                    url: 'https://github.com/test/repo.git',
                    accessToken: undefined
                })
            });
        });

        expect(mockOnRepositoryAdded).toHaveBeenCalledWith(mockRepository);
    });

    it('handles git repository form errors', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: 'Repository not found' })
        });

        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Fill out form
        fireEvent.change(screen.getByPlaceholderText('e.g., My Project'), {
            target: { value: 'Test Repo' }
        });
        fireEvent.change(screen.getByPlaceholderText('https://github.com/user/repo.git'), {
            target: { value: 'https://github.com/invalid/repo.git' }
        });

        // Submit form
        fireEvent.click(screen.getByText('Add Repository'));

        await waitFor(() => {
            expect(screen.getByText('Repository not found')).toBeInTheDocument();
        });

        expect(mockOnRepositoryAdded).not.toHaveBeenCalled();
    });

    it('submits file upload form successfully', async () => {
        const mockRepository = {
            id: '2',
            name: 'Uploaded Repo',
            url: null
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRepository)
        });

        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Switch to upload tab
        fireEvent.click(screen.getByText('Upload ZIP'));

        // Fill out form
        fireEvent.change(screen.getByDisplayValue(''), {
            target: { value: 'Uploaded Repo' }
        });

        // Mock file selection
        const file = new File(['test content'], 'test-repo.zip', { type: 'application/zip' });
        const fileInput = screen.getByRole('button', { name: /click to select zip file/i })
            .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(fileInput, 'files', {
            value: [file],
            configurable: true,
        });

        fireEvent.change(fileInput);

        // Submit form
        fireEvent.click(screen.getByText('Upload Repository'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/repos/upload', {
                method: 'POST',
                body: expect.any(FormData)
            });
        });

        expect(mockOnRepositoryAdded).toHaveBeenCalledWith(mockRepository);
    });

    it('closes modal when close button clicked', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: '' })); // Close button (X)

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('disables submit button when form is incomplete', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        const submitButton = screen.getByText('Add Repository');
        expect(submitButton).toBeDisabled();

        // Fill name only
        fireEvent.change(screen.getByPlaceholderText('e.g., My Project'), {
            target: { value: 'Test Repo' }
        });

        expect(submitButton).toBeDisabled();

        // Fill URL as well
        fireEvent.change(screen.getByPlaceholderText('https://github.com/user/repo.git'), {
            target: { value: 'https://github.com/test/repo.git' }
        });

        expect(submitButton).not.toBeDisabled();
    });

    it('auto-generates project name from uploaded file', () => {
        render(
            <AddRepositoryModal
                onClose={mockOnClose}
                onRepositoryAdded={mockOnRepositoryAdded}
            />
        );

        // Switch to upload tab
        fireEvent.click(screen.getByText('Upload ZIP'));

        // Mock file selection
        const file = new File(['test content'], 'my-awesome-project.zip', { type: 'application/zip' });
        const fileInput = screen.getByRole('button', { name: /click to select zip file/i })
            .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(fileInput, 'files', {
            value: [file],
            configurable: true,
        });

        fireEvent.change(fileInput);

        // Check that project name was auto-filled
        expect(screen.getByDisplayValue('my-awesome-project')).toBeInTheDocument();
    });
});