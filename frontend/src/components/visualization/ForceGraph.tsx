import React, { useEffect, useRef } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { useAppStore } from '../../store';
import { GraphData, Node } from '../../types';

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const graphRef = useRef<any>(null);
  const { setSelectedNode } = useAppStore();

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-300);
      graphRef.current.d3Force('link').distance(100);
      graphRef.current.d3Force('center').strength(0.05);
    }
  }, []);

  const getNodeColor = (node: Node) => {
    const errorScale = node.errors / 10; // Normalize errors (0-10 scale)
    return `rgb(${Math.min(255, errorScale * 255)}, ${Math.max(0, 255 - errorScale * 255)}, 0)`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dependency Graph</h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
          <span className="text-gray-600 dark:text-gray-400">Few Errors</span>
          <span className="ml-2 inline-block w-3 h-3 rounded-full bg-red-400"></span>
          <span className="text-gray-600 dark:text-gray-400">Many Errors</span>
        </div>
      </div>
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel={node => `${node.name}\nErrors: ${node.errors}\nChurn: ${node.churn}`}
        nodeColor={getNodeColor}
        nodeRelSize={6}
        linkWidth={link => Math.sqrt(link.value)}
        linkColor={() => '#999'}
        width={width}
        height={height}
        onNodeClick={(node) => setSelectedNode(node as Node)}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)}
      />
    </div>
  );
};

export default ForceGraph;