import { create } from 'zustand';
import { Repository, GraphData, Documentation, Node } from '../types';
import { mockRepositories, mockGraphData, mockDocumentation } from '../data/mockData';

interface AppState {
  repositories: Repository[];
  currentRepository: Repository | null;
  graphData: GraphData;
  selectedNode: Node | null;
  documentation: Record<string, Documentation>;
  isDarkMode: boolean;
  
  // Actions
  setCurrentRepository: (repository: Repository) => void;
  setSelectedNode: (node: Node | null) => void;
  toggleDarkMode: () => void;
  
  // Initialization
  fetchRepositories: () => Promise<void>;
  fetchGraphData: (repoId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  repositories: [],
  currentRepository: null,
  graphData: { nodes: [], links: [] },
  selectedNode: null,
  documentation: {},
  isDarkMode: false,
  
  setCurrentRepository: (repository) => set({ 
    currentRepository: repository,
    selectedNode: null 
  }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  fetchRepositories: async () => {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    set({ repositories: mockRepositories });
  },
  
  fetchGraphData: async (repoId) => {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    set({ 
      graphData: mockGraphData,
      documentation: mockDocumentation
    });
  }
}));