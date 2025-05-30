import React from 'react';
import { BookOpen, Code, Package, FunctionSquare as FunctionIcon } from 'lucide-react';
import { Documentation } from '../../types';

interface DocumentationPanelProps {
  documentation: Documentation | null;
}

const DocumentationPanel: React.FC<DocumentationPanelProps> = ({ documentation }) => {
  if (!documentation) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <BookOpen className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Select a component to view documentation</p>
      </div>
    );
  }

  const getTypeIcon = () => {
    switch (documentation.type) {
      case 'file':
        return <Code className="h-5 w-5 text-blue-500" />;
      case 'class':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'function':
        return <FunctionIcon className="h-5 w-5 text-green-500" />;
      case 'module':
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      default:
        return <Code className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md h-full overflow-auto">
      <div className="flex items-center mb-6">
        {getTypeIcon()}
        <h3 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
          {documentation.name}
        </h3>
        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {documentation.type}
        </span>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Description
        </h4>
        <p className="text-gray-700 dark:text-gray-300">
          {documentation.description}
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Usage Notes
        </h4>
        <p className="text-gray-700 dark:text-gray-300">
          {documentation.usageNotes}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Examples
        </h4>
        <div className="space-y-4">
          {documentation.examples.map((example, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: example.replace(/```typescript\n|```/g, '') }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationPanel;