import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize2, ShieldAlert, Folder, FileText, CheckCircle2 } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import type { GraphNode } from '../../types/eunomia';

export const StructuralFileGraphView: React.FC = () => {
  const { graphNodes, selectFile, files, setActiveTab } = useEunomiaStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(graphNodes[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (node.type === 'file') {
      const match = files.find(f => f.name.toLowerCase().includes(node.label.toLowerCase().split('.')[0]));
      if (match) selectFile(match);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Graph Toolbar */}
      <div 
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--bg-panel)',
          borderBottom: 'var(--border-rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Network size={18} color="var(--accent-bronze)" />
          <h2 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
            Structural File & Provenance Graph
          </h2>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            MODE: HIERARCHICAL (PHYSICS DISABLED)
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-icon"
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono" style={{ fontSize: '11px', width: '45px', textAlign: 'center' }}>
            {zoomLevel}%
          </span>
          <button 
            className="btn-icon"
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            className="btn-icon"
            onClick={() => setZoomLevel(100)}
            title="Reset Zoom"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* SVG/2D Orthogonal Graph Canvas */}
        <div 
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-canvas)',
            position: 'relative',
            overflow: 'auto',
            padding: '40px',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease'
          }}
        >
          {/* SVG Connector Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '1000px', height: '600px', pointerEvents: 'none' }}>
            {/* Root to Physics & Chem */}
            <path d="M 400 90 L 400 120 L 200 120 L 200 150" fill="none" stroke="#171A1F" strokeWidth="2" />
            <path d="M 400 120 L 600 120 L 600 150" fill="none" stroke="#171A1F" strokeWidth="2" />
            
            {/* Physics to Files */}
            <path d="M 200 190 L 200 230 L 100 230 L 100 270" fill="none" stroke="#171A1F" strokeWidth="2" />
            <path d="M 200 230 L 280 230 L 280 270" fill="none" stroke="#171A1F" strokeWidth="2" />
            <path d="M 200 230 L 420 230 L 420 270" fill="none" stroke="#BA1A1A" strokeWidth="2" strokeDasharray="4" />
            
            {/* Chem to File */}
            <path d="M 600 190 L 600 270" fill="none" stroke="#171A1F" strokeWidth="2" />

            {/* File to Version */}
            <path d="M 100 310 L 100 370" fill="none" stroke="#82510E" strokeWidth="2" />
          </svg>

          {/* Render Nodes */}
          {graphNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isTampered = node.status === 'TAMPERED';
            
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  backgroundColor: node.type === 'folder' ? 'var(--bg-panel)' : (isTampered ? '#FFDAD6' : '#FFF'),
                  border: isSelected ? '3px solid var(--accent-bronze)' : (isTampered ? '2px solid var(--accent-red)' : '1.5px solid #171A1F'),
                  padding: '10px 14px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 5
                }}
              >
                {node.type === 'folder' && <Folder size={16} color="var(--accent-bronze)" />}
                {node.type === 'file' && <FileText size={16} color={isTampered ? 'var(--accent-red)' : 'var(--accent-copper)'} />}
                {node.type === 'version' && <CheckCircle2 size={14} color="var(--accent-olive)" />}

                <div>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: isTampered ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {node.label}
                  </span>
                  {node.size && (
                    <p className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {node.size}
                    </p>
                  )}
                </div>

                {isTampered && (
                  <span title="Tamper Hash Alert!">
                    <ShieldAlert size={14} color="var(--accent-red)" style={{ marginLeft: '4px' }} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div 
            style={{
              width: '280px',
              backgroundColor: 'var(--bg-panel)',
              borderLeft: 'var(--border-rule)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NODE INSPECTOR</span>
              <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0' }}>
                {selectedNode.label}
              </h3>
              <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '16px' }}>
                Path: {selectedNode.path}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NODE TYPE</span>
                  <p style={{ fontWeight: 600 }}>{selectedNode.type.toUpperCase()}</p>
                </div>
                <div>
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>INTEGRITY STATUS</span>
                  <p style={{ fontWeight: 700, color: selectedNode.status === 'VALID' ? 'var(--accent-olive)' : 'var(--accent-red)' }}>
                    {selectedNode.status === 'VALID' ? 'CHAIN INTACT' : 'TAMPER DETECTED'}
                  </p>
                </div>
              </div>
            </div>

            {selectedNode.type === 'file' && (
              <button 
                className="btn-primary"
                onClick={() => setActiveTab('files')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Inspect in File View
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
