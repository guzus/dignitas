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

const TrustGraph = ({ 
  data, 
  isPaused, 
  onTogglePause,
  selectedAgent,
  onSelectAgent 
}: { 
  data: GraphData, 
  isPaused: boolean, 
  onTogglePause: () => void,
  selectedAgent: string | null,
  onSelectAgent: (id: string | null) => void
}) => {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus on selected agent when it changes
  useEffect(() => {
    if (selectedAgent && fgRef.current) {
      const node = data.nodes.find(n => n.id === selectedAgent);
      if (node) {
        // Center view on node
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(2.5, 1000);
      }
    }
  }, [selectedAgent, data.nodes]);

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
      // Increase repulsion significantly to fill the canvas
      fgRef.current.d3Force('charge').strength(-1000).distanceMax(1000);
      // Set a larger minimum distance for links
      fgRef.current.d3Force('link').distance(200);
      // Add a small center force to keep it somewhat centered but loose
      fgRef.current.d3Force('center').strength(0.05);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800 group">
      
      {hoveredNode && !selectedLink && (
        <div 
          className="absolute z-20 pointer-events-none bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-xl"
          style={{ 
            left: hoveredNode.x + dimensions.width / 2, 
            top: hoveredNode.y + dimensions.height / 2 - 60,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${hoveredNode.val > 0.5 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
            <span className="font-mono text-xs text-slate-200 font-bold">Agent</span>
          </div>
          <div className="font-mono text-xs text-slate-400">{hoveredNode.id}</div>
          <div className="mt-1 text-xs font-medium text-emerald-400">
            Trust Score: {(hoveredNode.val * 100).toFixed(1)}%
          </div>
        </div>
      )}

      {selectedLink && (
        <div className="absolute top-4 left-4 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Interaction Details</h3>
            <button onClick={() => setSelectedLink(null)} className="text-slate-500 hover:text-slate-300">
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Type</div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                selectedLink.type === 'negative_feedback' 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {selectedLink.type === 'negative_feedback' ? 'Negative Feedback' : 'Positive Feedback'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-medium uppercase">Review</div>
              <p className="text-sm text-slate-300 italic">
                "{selectedLink.review || (selectedLink.type === 'negative_feedback' 
                  ? "Service was slow and output was inaccurate. Would not recommend." 
                  : "Excellent execution speed and high availability. Trusted partner.")}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>From: {selectedLink.source.id ? selectedLink.source.id.slice(0,6) : '...'}...</span>
                <span>To: {selectedLink.target.id ? selectedLink.target.id.slice(0,6) : '...'}...</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                <div>
                  <span className="text-slate-500">Tx Hash:</span>
                  <div className="text-slate-400">0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 6)}</div>
                </div>
                <div>
                  <span className="text-slate-500">Block:</span>
                  <div className="text-slate-400">18{Math.floor(Math.random() * 100000)}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Timestamp:</span>
                  <div className="text-slate-400">{new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel={() => ""} // Disable default label
        onNodeHover={(node) => setHoveredNode(node)}
        onNodeClick={(node) => {
          onSelectAgent(node.id);
          // Center view on node
          fgRef.current.centerAt(node.x, node.y, 1000);
          fgRef.current.zoom(2.5, 1000);
        }}
        onLinkClick={(link) => {
          setSelectedLink(link);
          if (!isPaused) onTogglePause(); // Pause when viewing details
        }}
        nodeColor={(node: any) => {
          // Oracle is just a high-trust node now (Green)
          if (node.val > 0.8) return '#10b981'; // Premium (Green)
          if (node.val > 0.5) return '#3b82f6'; // Standard (Blue)
          return '#f59e0b'; // Basic (Orange)
        }}
        nodeVal={(node: any) => {
          // Base size + score multiplier. Oracle gets extra size.
          const base = node.id === 'Dignitas Oracle' ? 30 : 12; // Increased from 25/8
          return base + (node.val * 20); // Increased multiplier from 15
        }}
        nodeRelSize={1}
        // Highlight selected node with a ring
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (selectedAgent === node.id) {
            const base = node.id === 'Dignitas Oracle' ? 30 : 12;
            const size = base + (node.val * 20);
            const r = Math.sqrt(Math.max(0, size)) * 1 + 2; // Radius + padding

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.strokeStyle = '#f472b6'; // Pink ring
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
          }
        }}
        linkColor={(link: any) => {
          if (link.type === 'negative_feedback') return '#ef4444'; // Red for negative
          return '#10b981'; // Green for everything else (positive feedback)
        }}
        linkWidth={(link: any) => 2} // Make links clickable
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(d: any) => d.value * 0.001}
        backgroundColor="#020617" // slate-950
      />
      
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur p-4 rounded-lg border border-slate-800 text-xs shadow-xl space-y-3">
        <div>
          <div className="font-semibold text-slate-400 mb-2 uppercase tracking-wider text-[10px]">Trust Tiers</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-slate-300">High Trust (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Medium Trust (&gt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Low Trust (&lt;50%)</span>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-slate-800"></div>

        <div>
          <div className="font-semibold text-slate-400 mb-2 uppercase tracking-wider text-[10px]">Interactions</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-500"></span>
              <span className="text-slate-300">Positive Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-500"></span>
              <span className="text-slate-300">Negative Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustGraph;
