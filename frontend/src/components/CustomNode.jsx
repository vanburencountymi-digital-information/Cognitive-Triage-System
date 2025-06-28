import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable }) => {
  const hasPersona = data.persona && data.persona.trim() !== '';
  
  return (
    <div className={`custom-node ${!hasPersona ? 'blank-node' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className="node-content">
        <div className="node-header">
          <h4>{data.role}</h4>
        </div>
        <div className="node-body">
          <div className="persona-display">
            {hasPersona ? (
              <strong>{data.persona}</strong>
            ) : (
              <strong className="blank-persona">No persona selected</strong>
            )}
          </div>
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