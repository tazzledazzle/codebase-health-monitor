export interface Repository {
  id: string;
  name: string;
  url: string;
  stats: RepositoryStats;
  lastUpdated: string;
}

export interface RepositoryStats {
  files: number;
  classes: number;
  functions: number;
  errors: number;
  churn: number;
  docCoverage: number;
}

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  size: number;
  churn: number;
  errors: number;
  lastModified: string;
}

export interface Dependency {
  source: string;
  target: string;
  strength: number;
}

export interface Node {
  id: string;
  name: string;
  type: 'file' | 'class' | 'function' | 'module';
  errors: number;
  churn: number;
  size: number;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface Documentation {
  id: string;
  name: string;
  type: 'file' | 'class' | 'function' | 'module';
  description: string;
  usageNotes: string;
  examples: string[];
}

export interface ErrorData {
  id: string;
  message: string;
  count: number;
  lastOccurred: string;
  stackTrace: string;
  relatedFiles: string[];
}