import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import SpecialNode from './SpecialNode';
import { apiService } from '../api';

// Define nodeTypes outside component to prevent React Flow warning
const nodeTypes = {
  custom: CustomNode,
  special: SpecialNode,
};

const GraphCanvas = ({ onGraphChange, selectedPersona, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [specialNodes, setSpecialNodes] = useState([]);
  const [loadingSpecialNodes, setLoadingSpecialNodes] = useState(true);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Load special nodes on component mount
  useEffect(() => {
    const loadSpecialNodes = async () => {
      try {
        setLoadingSpecialNodes(true);
        const specialNodesData = await apiService.getSpecialNodes();
        setSpecialNodes(specialNodesData);
        
        // Convert special nodes to ReactFlow nodes
        const specialFlowNodes = specialNodesData.map((specialNode, index) => ({
          id: specialNode.id || `special-${index}`,
          type: 'special',
          position: { x: 50 + (index * 200), y: 50 }, // Position special nodes at the top
          data: {
            ...specialNode,
            type: specialNode.type || 'special',
            description: specialNode.description || 'Special system node',
          },
        }));
        
        // Add special nodes to the graph
        setNodes(prevNodes => {
          // Filter out any existing special nodes to avoid duplicates
          const nonSpecialNodes = prevNodes.filter(node => !node.id.startsWith('special-'));
          return [...nonSpecialNodes, ...specialFlowNodes];
        });
      } catch (error) {
        console.error('Failed to load special nodes:', error);
      } finally {
        setLoadingSpecialNodes(false);
      }
    };

    loadSpecialNodes();
  }, []);

  // Update parent component when graph changes
  React.useEffect(() => {
    const graphData = {
      nodes: nodes.map(node => ({
        id: node.id,
        persona: node.data.persona,
        role: node.data.role,
        type: node.data.type, // Include node type for special nodes
        prompt: node.data.prompt, // Include prompt for special nodes
      })),
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target
      }))
    };
    onGraphChange(graphData);
  }, [nodes, edges, onGraphChange]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    onNodeSelect(node);
  }, [onNodeSelect]);

  const onNodeDragStop = useCallback((event, node) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            position: node.position,
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  const addNode = useCallback(() => {
    if (!selectedPersona) {
      alert('Please select a persona first');
      return;
    }

    // Calculate center position of current viewport
    let centerPosition = { x: 100, y: 100 }; // fallback position
    
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport();
      const container = reactFlowWrapper.current;
      
      if (container) {
        const rect = container.getBoundingClientRect();
        
        // Calculate the center of the current viewport in flow coordinates
        // The viewport center is at (width/2, height/2) in screen coordinates
        // We need to convert this to flow coordinates
        const screenCenterX = rect.width / 2;
        const screenCenterY = rect.height / 2;
        
        // Convert screen coordinates to flow coordinates using viewport
        // Formula: flowX = (screenX - viewport.x) / viewport.zoom
        // Formula: flowY = (screenY - viewport.y) / viewport.zoom
        centerPosition = {
          x: (screenCenterX - viewport.x) / viewport.zoom,
          y: (screenCenterY - viewport.y) / viewport.zoom,
        };
        
        // Debug logging to help troubleshoot
        console.log('Viewport:', viewport);
        console.log('Container rect:', rect);
        console.log('Screen center:', { x: screenCenterX, y: screenCenterY });
        console.log('Flow center:', centerPosition);
      }
    }

    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: centerPosition,
      data: {
        persona: selectedPersona,
        role: 'Agent',
        onPersonaChange: (newPersona) => {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === newNodeId) {
                return {
                  ...n,
                  data: { ...n.data, persona: newPersona },
                };
              }
              return n;
            })
          );
        },
        onDelete: () => {
          setNodes((nds) => nds.filter((n) => n.id !== newNodeId));
          setEdges((eds) => eds.filter((e) => e.source !== newNodeId && e.target !== newNodeId));
        },
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [selectedPersona, setNodes, setEdges, reactFlowInstance]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      // Don't allow deletion of special nodes
      if (selectedNode.type === 'special') {
        alert('Special nodes cannot be deleted');
        return;
      }
      
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const clearGraph = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire graph? This will remove all agent nodes but keep special nodes.')) {
      // Keep special nodes, remove only agent nodes
      setNodes((nds) => nds.filter((n) => n.type === 'special'));
      setEdges([]);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges]);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  return (
    <div className="graph-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
        <MiniMap />
        
        <Panel position="top-left">
          <div className="graph-controls">
            <button 
              className="btn btn-primary"
              onClick={addNode}
              disabled={!selectedPersona}
              title={!selectedPersona ? "Select a persona first" : "Add new node"}
            >
              Add Node
            </button>
            <button 
              className="btn btn-danger"
              onClick={deleteSelectedNode}
              disabled={!selectedNode || selectedNode?.type === 'special'}
              title={!selectedNode ? "Select a node first" : selectedNode?.type === 'special' ? "Special nodes cannot be deleted" : "Delete selected node"}
            >
              Delete Node
            </button>
            <button 
              className="btn btn-warning"
              onClick={clearGraph}
              disabled={nodes.filter(n => n.type !== 'special').length === 0}
              title={nodes.filter(n => n.type !== 'special').length === 0 ? "No agent nodes to clear" : "Clear all agent nodes (keeps special nodes)"}
            >
              Clear Agent Nodes
            </button>
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="graph-info">
            <div className="info-item">
              <strong>Agent Nodes:</strong> {nodes.filter(n => n.type !== 'special').length}
            </div>
            <div className="info-item">
              <strong>Special Nodes:</strong> {nodes.filter(n => n.type === 'special').length}
            </div>
            <div className="info-item">
              <strong>Edges:</strong> {edges.length}
            </div>
            {selectedNode && (
              <div className="info-item">
                <strong>Selected:</strong> {selectedNode.data.persona || selectedNode.data.type}
              </div>
            )}
            {loadingSpecialNodes && (
              <div className="info-item" style={{ color: '#666', fontStyle: 'italic' }}>
                Loading special nodes...
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default GraphCanvas; 