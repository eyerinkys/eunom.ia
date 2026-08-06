import React, { useState, useRef, useMemo } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize2, ShieldAlert, Folder, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import type { GraphNode } from '../../types/eunomia';

interface NodePosition extends GraphNode {
  x: number;
  y: number;
}

interface GraphEdge {
  source: string;
  target: string;
  isTampered?: boolean;
  label?: string;
}

export const StructuralFileGraphView: React.FC = () => {
  const { graphNodes, selectFile, files, setActiveTab } = useEunomiaStore();

  // Dynamic layout calculation based on node count and tree depth
  const computeInitialPositions = (nodesList: GraphNode[]): NodePosition[] => {
    const count = nodesList.length;

    // Calculate node dimensions dynamically to prevent overlap
    let width = 160;
    if (count <= 6) width = 200;
    else if (count <= 10) width = 160;
    else width = 130;

    // Group nodes by depth
    const depthMap = new Map<number, GraphNode[]>();
    nodesList.forEach(n => {
      const depth = n.depth ?? 0;
      if (!depthMap.has(depth)) depthMap.set(depth, []);
      depthMap.get(depth)!.push(n);
    });

    const canvasWidth = 1000;
    const levelHeight = 130;
    const startY = 50;

    const result: NodePosition[] = [];

    depthMap.forEach((levelNodes, depth) => {
      const levelCount = levelNodes.length;
      const stepX = canvasWidth / (levelCount + 1);

      levelNodes.forEach((n, idx) => {
        const calculatedX = Math.round((idx + 1) * stepX - width / 2);
        const calculatedY = startY + depth * levelHeight;

        result.push({
          ...n,
          x: n.x ?? calculatedX,
          y: n.y ?? calculatedY,
        });
      });
    });

    return result;
  };

  const [nodes, setNodes] = useState<NodePosition[]>(() => computeInitialPositions(graphNodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialNodeX: number; initialNodeY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialNodeX: 0,
    initialNodeY: 0,
  });

  const nodeCount = nodes.length;

  // Responsive sizing specs based on node count
  const nodeSpecs = useMemo(() => {
    if (nodeCount <= 6) {
      return { width: 200, height: 50, fontSize: '13px', iconSize: 20, padding: '12px 16px' };
    } else if (nodeCount <= 10) {
      return { width: 160, height: 44, fontSize: '11px', iconSize: 17, padding: '10px 14px' };
    } else {
      return { width: 130, height: 38, fontSize: '10px', iconSize: 15, padding: '8px 10px' };
    }
  }, [nodeCount]);

  // Derive interconnecting edges from parent-child links + provenance cross-links
  const edges = useMemo<GraphEdge[]>(() => {
    const derived: GraphEdge[] = [];

    // 1. Parent-child structural hierarchy links
    nodes.forEach(n => {
      if (n.parentId) {
        derived.push({
          source: n.parentId,
          target: n.id,
          isTampered: n.status === 'TAMPERED',
        });
      }
    });

    // 2. Interconnecting cross-links (e.g. Tampered draft derivative link)
    const tamperedNode = nodes.find(n => n.status === 'TAMPERED');
    const validPaperNode = nodes.find(n => n.id === 'gn-f1');
    if (tamperedNode && validPaperNode && tamperedNode.id !== validPaperNode.id) {
      derived.push({
        source: validPaperNode.id,
        target: tamperedNode.id,
        isTampered: true,
        label: 'CROSS-VERIFICATION LINK',
      });
    }

    return derived;
  }, [nodes]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;

  // Handle node selection & store file sync
  const handleNodeClick = (node: NodePosition) => {
    setSelectedNodeId(node.id);
    if (node.type === 'file') {
      const match = files.find(f => f.name.toLowerCase().includes(node.label.toLowerCase().split('.')[0]));
      if (match) selectFile(match);
    }
  };

  // Reset positions to initial default graph layout
  const handleResetLayout = () => {
    setNodes(computeInitialPositions(graphNodes));
  };

  // Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if unsupported
    }

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialNodeX: node.x,
      initialNodeY: node.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId) return;

    const scale = zoomLevel / 100;
    const deltaX = (e.clientX - dragStartRef.current.mouseX) / scale;
    const deltaY = (e.clientY - dragStartRef.current.mouseY) / scale;

    const newX = dragStartRef.current.initialNodeX + deltaX;
    const newY = dragStartRef.current.initialNodeY + deltaY;

    setNodes(prev =>
      prev.map(n =>
        n.id === draggingNodeId
          ? {
              ...n,
              x: Math.max(10, Math.min(1100, newX)),
              y: Math.max(10, Math.min(700, newY)),
            }
          : n
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingNodeId(null);
    }
  };

  // Node lookup map for dynamic SVG connectors
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodePosition>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Graph Header Toolbar */}
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
          <span className="font-sans" style={{ fontSize: '11px', color: 'var(--accent-olive)', fontWeight: 600 }}>
            NODES: {nodeCount}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleResetLayout}
            style={{ padding: '6px 12px', fontSize: '11px', gap: '6px' }}
            title="Reset Graph Layout"
          >
            <RefreshCw size={13} /> Reset Layout
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: '#2E3746', margin: '0 4px' }} />

          <button 
            className="btn-icon"
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-sans" style={{ fontSize: '11px', width: '45px', textAlign: 'center', fontWeight: 600 }}>
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

      {/* Canvas Workspace */}
      <div 
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', userSelect: 'none' }}
      >
        {/* Graph Canvas */}
        <div 
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-canvas)',
            position: 'relative',
            overflow: 'auto',
            minWidth: '1100px',
            minHeight: '750px',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease'
          }}
        >
          {/* Dynamic Interconnected SVG Connector Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#C69A42" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#E03E3E" />
              </marker>
            </defs>

            {edges.map((edge, idx) => {
              const srcNode = nodeMap.get(edge.source);
              const tgtNode = nodeMap.get(edge.target);
              if (!srcNode || !tgtNode) return null;

              // Compute precise connection points (Bottom center of source -> Top center of target)
              const x1 = srcNode.x + nodeSpecs.width / 2;
              const y1 = srcNode.y + nodeSpecs.height;
              const x2 = tgtNode.x + nodeSpecs.width / 2;
              const y2 = tgtNode.y;

              // Smooth Orthogonal Stepped Connector Path
              const midY = (y1 + y2) / 2;
              const pathD = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

              return (
                <g key={`${edge.source}-${edge.target}-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edge.isTampered ? 'var(--accent-red)' : '#2E3746'}
                    strokeWidth="2"
                    strokeDasharray={edge.isTampered ? '4 4' : 'none'}
                    markerEnd={edge.isTampered ? 'url(#arrow-red)' : 'url(#arrow)'}
                  />
                  {/* Connection Node Point */}
                  <circle cx={x1} cy={y1} r="3" fill={edge.isTampered ? 'var(--accent-red)' : 'var(--accent-bronze)'} />
                  <circle cx={x2} cy={y2} r="3" fill={edge.isTampered ? 'var(--accent-red)' : 'var(--accent-bronze)'} />
                </g>
              );
            })}
          </svg>

          {/* Render Movable & Scaled Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isTampered = node.status === 'TAMPERED';
            const isDragging = draggingNodeId === node.id;
            
            return (
              <div
                key={node.id}
                onPointerDown={(e) => handlePointerDown(e, node.id)}
                onClick={() => handleNodeClick(node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${nodeSpecs.width}px`,
                  height: `${nodeSpecs.height}px`,
                  backgroundColor: 'var(--bg-panel)',
                  border: isSelected ? '2px solid var(--accent-bronze)' : (isTampered ? '2px solid var(--accent-red)' : 'var(--border-rule)'),
                  padding: nodeSpecs.padding,
                  borderRadius: '3px',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  boxShadow: isDragging 
                    ? '0 8px 24px rgba(198, 154, 66, 0.4)' 
                    : (isSelected ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.2)'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: isDragging ? 20 : (isSelected ? 10 : 5),
                  touchAction: 'none',
                  transition: isDragging ? 'none' : 'box-shadow 0.15s ease, border 0.15s ease',
                  userSelect: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {node.type === 'folder' && <Folder size={nodeSpecs.iconSize} color="var(--accent-bronze)" style={{ flexShrink: 0 }} />}
                {node.type === 'file' && <FileText size={nodeSpecs.iconSize} color={isTampered ? 'var(--accent-red)' : 'var(--accent-copper)'} style={{ flexShrink: 0 }} />}
                {node.type === 'version' && <CheckCircle2 size={nodeSpecs.iconSize - 2} color="var(--accent-olive)" style={{ flexShrink: 0 }} />}

                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <span 
                    className="font-sans" 
                    style={{ 
                      fontSize: nodeSpecs.fontSize, 
                      fontWeight: 700, 
                      color: isTampered ? 'var(--accent-red)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      display: 'block'
                    }}
                    title={node.label}
                  >
                    {node.label}
                  </span>
                  {node.size && (
                    <p className="font-sans" style={{ fontSize: '9px', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap' }}>
                      {node.size}
                    </p>
                  )}
                </div>

                {isTampered && (
                  <span title="Tamper Hash Alert!" style={{ flexShrink: 0 }}>
                    <ShieldAlert size={nodeSpecs.iconSize - 2} color="var(--accent-red)" />
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
              width: '290px',
              backgroundColor: 'var(--bg-panel)',
              borderLeft: 'var(--border-rule)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 30,
              flexShrink: 0
            }}
          >
            <div>
              <span className="font-sans" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                NODE INSPECTOR
              </span>
              <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0', color: 'var(--text-primary)' }}>
                {selectedNode.label}
              </h3>
              <p className="font-sans" style={{ fontSize: '11px', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '20px' }}>
                Path: {selectedNode.path}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                <div>
                  <span className="font-sans" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    NODE TYPE
                  </span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedNode.type.toUpperCase()}</p>
                </div>
                <div>
                  <span className="font-sans" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    INTEGRITY STATUS
                  </span>
                  <p style={{ fontWeight: 700, color: selectedNode.status === 'VALID' ? 'var(--accent-olive)' : 'var(--accent-red)' }}>
                    {selectedNode.status === 'VALID' ? 'CHAIN INTACT (VALID)' : 'TAMPER DETECTED'}
                  </p>
                </div>
                <div>
                  <span className="font-sans" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    NODE COORDINATES
                  </span>
                  <p className="font-code" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                    X: {Math.round(selectedNode.x)}px | Y: {Math.round(selectedNode.y)}px
                  </p>
                </div>
              </div>
            </div>

            {selectedNode.type === 'file' && (
              <button 
                className="btn-primary"
                onClick={() => setActiveTab('files')}
                style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
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
