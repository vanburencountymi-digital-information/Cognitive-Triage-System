import React, { useState, useCallback, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
  onEdgeClick,
  onEdgeUpdate,
  onEdgeDelete,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Get available nodes from data prop
  const availableNodes = data?.availableNodes || [];

  const handleEdgeClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Calculate menu position near the edge
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Position menu above the click point, but ensure it stays within viewport
    setMenuPosition({
      x: clickX,
      y: clickY - 10, // Offset slightly above click point
    });
    
    setShowMenu(true);
    onEdgeClick?.(id);
  }, [id, onEdgeClick]);

  const handleDelete = useCallback(() => {
    onEdgeDelete?.(id);
    setShowMenu(false);
  }, [id, onEdgeDelete]);

  const handleSourceChange = useCallback((newSource) => {
    // Prevent self-loops
    if (newSource === data.target) {
      alert('Source and target cannot be the same node');
      return;
    }
    onEdgeUpdate?.(id, { source: newSource, target: data.target });
    setShowMenu(false);
  }, [id, data.target, onEdgeUpdate]);

  const handleTargetChange = useCallback((newTarget) => {
    // Prevent self-loops
    if (data.source === newTarget) {
      alert('Source and target cannot be the same node');
      return;
    }
    onEdgeUpdate?.(id, { source: data.source, target: newTarget });
    setShowMenu(false);
  }, [id, data.source, onEdgeUpdate]);

  const handleMenuClose = useCallback(() => {
    setShowMenu(false);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  // Close menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showMenu]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#ff6b6b' : '#b1b1b7',
          strokeWidth: selected ? 3 : 2,
          cursor: 'pointer',
        }}
        onClick={handleEdgeClick}
      />
      
      {showMenu && (
        <EdgeLabelRenderer>
          <div
            className="edge-menu"
            style={{
              position: 'absolute',
              left: menuPosition.x,
              top: menuPosition.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edge-menu-content">
              <div className="edge-menu-header">
                <span>Edge Options</span>
                <button
                  className="btn-close"
                  onClick={handleMenuClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '0',
                    marginLeft: 'auto'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="edge-menu-body">
                <div className="form-group">
                  <label>Source Node:</label>
                  <select
                    className="form-select form-select-sm"
                    value={data.source}
                    onChange={(e) => handleSourceChange(e.target.value)}
                  >
                    {availableNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.data?.persona || node.data?.type || node.id}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Target Node:</label>
                  <select
                    className="form-select form-select-sm"
                    value={data.target}
                    onChange={(e) => handleTargetChange(e.target.value)}
                  >
                    {availableNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.data?.persona || node.data?.type || node.id}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  className="btn btn-danger btn-sm w-100"
                  onClick={handleDelete}
                >
                  🗑️ Delete Edge
                </button>
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge; 