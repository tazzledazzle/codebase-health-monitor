import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, Node } from '../../types';
import { useAppStore } from '../../store';

interface DependencyGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setSelectedNode } = useAppStore();

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create a simulation with forces
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => 
        Math.sqrt(d.size) / 2 + 10));

    // Create a color scale for errors
    const colorScale = d3.scaleLinear<string>()
      .domain([0, d3.max(data.nodes, d => d.errors) || 0])
      .range(['#4ADE80', '#EF4444'])
      .clamp(true);

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.size) / 2)
      .attr('fill', d => colorScale(d.errors))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .call(drag(simulation) as any)
      .on('click', (event, d: any) => {
        setSelectedNode(d as Node);
      });

    // Add labels to nodes
    const labels = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text(d => d.name)
      .attr('font-size', 10)
      .attr('dx', d => Math.sqrt(d.size) / 2 + 5)
      .attr('dy', 4)
      .attr('pointer-events', 'none')
      .attr('fill', 'currentColor')
      .attr('class', 'text-gray-700 dark:text-gray-300');

    // Update positions on each simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Tooltip
    node.append('title')
      .text(d => `${d.name}\nErrors: ${d.errors}\nChurn: ${d.churn}`);

    // Create drag behavior
    function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, setSelectedNode]);

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
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          ref={svgRef}
          className="w-full h-full transition-colors duration-200"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default DependencyGraph;