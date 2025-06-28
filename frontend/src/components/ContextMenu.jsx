import React from 'react';

const ContextMenu = ({ 
  selectedNode, 
  selectedEdge, 
  position, 
  onPersonaChange, 
  onDeleteNode, 
  onDeleteEdge,
  availablePersonas = []
}) => {
  console.log('ContextMenu render:', { selectedNode, selectedEdge, position });
  
  if (!selectedNode && !selectedEdge) {
    console.log('ContextMenu: No selection, returning null');
    return null;
  }

  console.log('ContextMenu: Rendering menu at position:', position);

  const getNodeDisplayName = (node) => {
    if (node.data?.persona) {
      return node.data.persona;
    }
    if (node.data?.type) {
      return node.data.type;
    }
    return node.id;
  };

  const getEdgeDisplayName = (edge) => {
    const sourceName = edge.source;
    const targetName = edge.target;
    return `${sourceName} → ${targetName}`;
  };

  return (
    <div 
      className="context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="context-menu-content">
        <div className="context-menu-header">
          <span>
            {selectedNode ? 'Node Details' : 'Edge Details'}
          </span>
        </div>
        
        <div className="context-menu-body">
          {selectedNode && (
            <div className="context-item">
              <div className="context-item-header">
                <strong>Selected Node:</strong>
              </div>
              <div className="context-item-value">
                {getNodeDisplayName(selectedNode)}
              </div>
              
              {selectedNode.type === 'custom' && (
                <div className="context-item-actions">
                  <div className="form-group">
                    <label>Persona:</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedNode.data.persona || ''}
                      onChange={(e) => onPersonaChange?.(selectedNode.id, e.target.value)}
                    >
                      <option value="">Select a persona...</option>
                      {availablePersonas.map((persona) => (
                        <option key={persona.name} value={persona.name}>
                          {persona.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => onDeleteNode?.(selectedNode.id)}
                  >
                    🗑️ Delete Node
                  </button>
                </div>
              )}
              
              {selectedNode.type === 'special' && (
                <div className="context-item-info">
                  <div className="info-text">
                    <strong>Type:</strong> {selectedNode.data.type}
                  </div>
                  {selectedNode.data.description && (
                    <div className="info-text">
                      <strong>Description:</strong> {selectedNode.data.description}
                    </div>
                  )}
                  <div className="info-text">
                    <em>Special nodes cannot be deleted</em>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {selectedEdge && (
            <div className="context-item">
              <div className="context-item-header">
                <strong>Selected Edge:</strong>
              </div>
              <div className="context-item-value">
                {getEdgeDisplayName(selectedEdge)}
              </div>
              
              <div className="context-item-actions">
                <button
                  className="btn btn-danger btn-sm w-100"
                  onClick={() => onDeleteEdge?.(selectedEdge.id)}
                >
                  🗑️ Delete Edge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextMenu; 