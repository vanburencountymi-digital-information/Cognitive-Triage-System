import React, { useState, useCallback, useRef } from 'react';
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

// Define nodeTypes outside component to prevent React Flow warning
const nodeTypes = {
  custom: CustomNode,
};

const GraphCanvas = ({ onGraphChange, selectedPersona, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Update parent component when graph changes
  React.useEffect(() => {
    const graphData = {
      nodes: nodes.map(node => ({
        id: node.id,
        persona: node.data.persona,
        role: node.data.role
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

    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: { x: 100, y: 100 },
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
  }, [selectedPersona, setNodes, setEdges]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const clearGraph = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire graph?')) {
      setNodes([]);
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
              disabled={!selectedNode}
              title={!selectedNode ? "Select a node first" : "Delete selected node"}
            >
              Delete Node
            </button>
            <button 
              className="btn btn-warning"
              onClick={clearGraph}
              disabled={nodes.length === 0}
              title={nodes.length === 0 ? "No nodes to clear" : "Clear entire graph"}
            >
              Clear Graph
            </button>
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="graph-info">
            <div className="info-item">
              <strong>Nodes:</strong> {nodes.length}
            </div>
            <div className="info-item">
              <strong>Edges:</strong> {edges.length}
            </div>
            {selectedNode && (
              <div className="info-item">
                <strong>Selected:</strong> {selectedNode.data.persona}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default GraphCanvas; 