import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RepositoryManager } from '../RepositoryManager';
import { useAppStore } from '../../../store';
import { Repository, RepositoryStatus } from '../../../types';

// Mock the store
jest.mock('../../../store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
    onmessage: null,
    onerror: null,
    close: jest.fn(),
}));

const mockRepositories: Repository[] = [
    {
        id: '1',
        name: 'Test Repository',
        url: 'https://github.com/test/repo',
        status: RepositoryStatus.READY,
        stats: {
            files: 100,
            classes: 20,
            functions: 150,
            errors: 5,
            churn: 25,
            docCoverage: 75
        },
        lastUpdated: '2023-10-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'Another Repository',
        url: 'https://github.com/test/another',
        status: RepositoryStatus.ANALYZING,
        stats: {
            files: 50,
            classes: 10,
            functions: 75,
            errors: 2,
            churn: 15,
            docCoverage: 60
        },
        lastUpdated: '2023-10-14T15:30:00Z'
    }
];

describe('RepositoryManager', () => {
    const mockFetchRepositories = jest.fn();
    const mockSetCurrentRepository = jest.fn();

    beforeEach(() => {
        mockUseAppStore.mockReturnValue({
            repositories: mockRepositories,
            currentRepository: null,
            fetchRepositories: mockFetchRepositories,
            setCurrentRepository: mockSetCurrentRepository,
            graphData: { nodes: [], links: [] },
            selectedNode: null,
            documentation: {},
            isDarkMode: false,
            setSelectedNode: jest.fn(),
            toggleDarkMode: jest.fn(),
            fetchGraphData: jest.fn()
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders repository manager with header', () => {
        render(<RepositoryManager />);

        expect(screen.getByText('Repository Manager')).toBeInTheDocument();
        expect(screen.getByText('Connect repositories and monitor codebase health')).toBeInTheDocument();
        expect(screen.getByText('Add Repository')).toBeInTheDocument();
    });

    it('fetches repositories on mount', () => {
        render(<RepositoryManager />);

        expect(mockFetchRepositories).toHaveBeenCalledTimes(1);
    });

    it('displays repository list', () => {
        render(<RepositoryManager />);

        expect(screen.getByText('Test Repository')).toBeInTheDocument();
        expect(screen.getByText('Another Repository')).toBeInTheDocument();
        expect(screen.getByText('Your Repositories (2)')).toBeInTheDocument();
    });

    it('opens add repository modal when button clicked', () => {
        render(<RepositoryManager />);

        const addButton = screen.getByText('Add Repository');
        fireEvent.click(addButton);

        expect(screen.getByText('Add Repository')).toBeInTheDocument();
        expect(screen.getByText('Git Repository')).toBeInTheDocument();
        expect(screen.getByText('Upload ZIP')).toBeInTheDocument();
    });

    it('handles repository selection', () => {
        render(<RepositoryManager />);

        const repositoryCard = screen.getByText('Test Repository').closest('div');
        fireEvent.click(repositoryCard!);

        expect(mockSetCurrentRepository).toHaveBeenCalledWith(mockRepositories[0]);
    });

    it('shows analysis progress for analyzing repositories', async () => {
        // Mock WebSocket implementation
        let wsMessageHandler: ((event: MessageEvent) => void) | null = null;

        (global.WebSocket as jest.Mock).mockImplementation(() => ({
            onmessage: null,
            onerror: null,
            close: jest.fn(),
            set onmessage(handler) {
                wsMessageHandler = handler;
            }
        }));

        render(<RepositoryManager />);

        // Simulate WebSocket message
        if (wsMessageHandler) {
            wsMessageHandler({
                data: JSON.stringify({ progress: 50, status: 'in_progress' })
            } as MessageEvent);
        }

        await waitFor(() => {
            expect(screen.getByText('Analysis in Progress')).toBeInTheDocument();
        });
    });

    it('displays empty state when no repositories', () => {
        mockUseAppStore.mockReturnValue({
            repositories: [],
            currentRepository: null,
            fetchRepositories: mockFetchRepositories,
            setCurrentRepository: mockSetCurrentRepository,
            graphData: { nodes: [], links: [] },
            selectedNode: null,
            documentation: {},
            isDarkMode: false,
            setSelectedNode: jest.fn(),
            toggleDarkMode: jest.fn(),
            fetchGraphData: jest.fn()
        });

        render(<RepositoryManager />);

        expect(screen.getByText('No repositories yet')).toBeInTheDocument();
        expect(screen.getByText('Add your first repository to start monitoring codebase health')).toBeInTheDocument();
    });
});