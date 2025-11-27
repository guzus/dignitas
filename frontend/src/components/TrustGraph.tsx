"use client";

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface Node {
  id: string;
  val: number;
  group: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const TrustGraph = ({ data }: { data: GraphData }) => {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-100);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="id"
        nodeColor={(node: any) => {
          if (node.val > 0.8) return '#10b981'; // Premium
          if (node.val > 0.5) return '#3b82f6'; // Standard
          return '#f59e0b'; // Basic
        }}
        nodeRelSize={6}
        linkColor={(link: any) => link.type === 'x402' ? '#f97316' : '#3b82f6'}
        linkWidth={(link: any) => link.type === 'x402' ? 2 : 1}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(d: any) => d.value * 0.001}
        backgroundColor="#020617" // slate-950
      />
      
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur p-3 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-0.5 bg-orange-500"></span> x402 Payment (2.0x)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-500"></span> Feedback (1.2x)
        </div>
      </div>
    </div>
  );
};

export default TrustGraph;
