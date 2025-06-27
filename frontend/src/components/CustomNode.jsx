import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [personaName, setPersonaName] = useState(data.persona);

  const handlePersonaChange = (newPersona) => {
    setPersonaName(newPersona);
    data.onPersonaChange(newPersona);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      data.onDelete();
    }
  };

  return (
    <div className="custom-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className="node-content">
        <div className="node-header">
          <h4>{data.role}</h4>
          <div className="node-actions">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsEditing(!isEditing)}
              title="Edit persona"
            >
              ✏️
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              title="Delete node"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div className="node-body">
          {isEditing ? (
            <div className="persona-edit">
              <input
                type="text"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                className="form-control form-control-sm"
                placeholder="Enter persona name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePersonaChange(personaName);
                  }
                }}
                onBlur={() => handlePersonaChange(personaName)}
                autoFocus
              />
            </div>
          ) : (
            <div className="persona-display">
              <strong>{data.persona || 'No persona selected'}</strong>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default CustomNode; 