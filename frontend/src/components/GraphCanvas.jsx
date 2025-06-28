import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import SpecialNode from './SpecialNode';
import CustomEdge from './CustomEdge';
import { apiService } from '../api';
import isEqual from 'lodash.isequal';

const nodeTypes = {
  custom: CustomNode,
  special: SpecialNode,
};

const GraphCanvas = ({ onGraphChange, selectedPersona, graphData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [loadingSpecialNodes, setLoadingSpecialNodes] = useState(true);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Load special nodes on component mount
  useEffect(() => {
    const loadSpecialNodes = async () => {
      try {
        setLoadingSpecialNodes(true);
        const specialNodesData = await apiService.getSpecialNodes();
        
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
  }, [setNodes]);

  // Handle loaded graph data from parent
  useEffect(() => {
    if (graphData && graphData.nodes && graphData.edges) {
      // Convert graphData to ReactFlow format
      const flowNodes = graphData.nodes
        .filter(node => node.id !== 'prompt' && node.type !== 'special')
        .map((node, idx) => ({
          id: node.id,
          type: 'custom',
          position: { x: 200 + idx * 200, y: 200 + idx * 100 },
          data: {
            persona: node.persona,
            role: node.role || 'Agent',
            onPersonaChange: (newPersona) => {
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id === node.id) {
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
              setNodes((nds) => nds.filter((n) => n.id !== node.id));
              setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
            },
          },
        }));

      const flowEdges = graphData.edges.map((edge, idx) => ({
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        type: 'custom',
        data: {
          source: edge.source,
          target: edge.target,
          availableNodes: nodes, // Pass available nodes to the edge
        },
      }));

      // Only update if different
      const currentNodes = nodes.filter(n => n.type !== 'special');
      const currentEdges = edges;

      if (
        !isEqual(
          currentNodes.map(n => ({ id: n.id, persona: n.data.persona, role: n.data.role })),
          flowNodes.map(n => ({ id: n.id, persona: n.data.persona, role: n.data.role }))
        ) ||
        !isEqual(
          currentEdges.map(e => ({ source: e.source, target: e.target })),
          flowEdges.map(e => ({ source: e.source, target: e.target }))
        )
      ) {
        setNodes(prevNodes => {
          const specialNodes = prevNodes.filter(node => node.type === 'special');
          return [...specialNodes, ...flowNodes];
        });
        setEdges(flowEdges);
      }
    }
    // eslint-disable-next-line
  }, [graphData]); // Only depend on graphData

  // Update parent component when graph changes
  useEffect(() => {
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
    (params) => {
      const newEdge = {
        ...params,
        type: 'custom',
        data: {
          source: params.source,
          target: params.target,
          availableNodes: nodes, // Pass available nodes to the edge
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null); // Clear edge selection when clicking node
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null); // Clear node selection when clicking edge
  }, []);

  const onEdgeDelete = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  const onEdgeUpdate = useCallback((edgeId, newConnection) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            source: newConnection.source,
            target: newConnection.target,
            data: {
              source: newConnection.source,
              target: newConnection.target,
              availableNodes: nodes, // Update available nodes
            },
          };
        }
        return edge;
      })
    );
  }, [setEdges, nodes]);

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

  // Keyboard delete functionality
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedEdge) {
          onEdgeDelete(selectedEdge.id);
        } else if (selectedNode) {
          // Don't allow deletion of special nodes
          if (selectedNode.type === 'special') {
            alert('Special nodes cannot be deleted');
            return;
          }
          setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
          setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
          setSelectedNode(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdge, selectedNode, onEdgeDelete, setNodes, setEdges]);

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
        const screenCenterX = rect.width / 2;
        const screenCenterY = rect.height / 2;
        
        // Convert screen coordinates to flow coordinates using viewport
        centerPosition = {
          x: (screenCenterX - viewport.x) / viewport.zoom,
          y: (screenCenterY - viewport.y) / viewport.zoom,
        };
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

  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      onEdgeDelete(selectedEdge.id);
    }
  }, [selectedEdge, onEdgeDelete]);

  const clearGraph = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire graph? This will remove all agent nodes but keep special nodes.')) {
      // Keep special nodes, remove only agent nodes
      setNodes((nds) => nds.filter((n) => n.type === 'special'));
      setEdges([]);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [setNodes, setEdges]);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  // Create edge types with handlers
  const edgeTypes = {
    custom: (props) => (
      <CustomEdge
        {...props}
        onEdgeClick={onEdgeClick}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeDelete={onEdgeDelete}
      />
    ),
  };

  return (
    <div className="graph-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
              className="btn btn-danger"
              onClick={deleteSelectedEdge}
              disabled={!selectedEdge}
              title={!selectedEdge ? "Select an edge first" : "Delete selected edge"}
            >
              Delete Edge
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
                <strong>Selected Node:</strong> {selectedNode.data.persona || selectedNode.data.type}
              </div>
            )}
            {selectedEdge && (
              <div className="info-item">
                <strong>Selected Edge:</strong> {selectedEdge.source} → {selectedEdge.target}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default GraphCanvas; 