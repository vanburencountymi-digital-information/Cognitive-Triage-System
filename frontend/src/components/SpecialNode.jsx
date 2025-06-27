import React from 'react';
import { Handle, Position } from 'reactflow';

const SpecialNode = ({ data, isConnectable }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #4a5568',
      borderRadius: '12px',
      padding: '1rem',
      minWidth: '180px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: 'white',
    };

    // Add different styles based on node type
    if (data.type === 'prompt') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        borderColor: '#2f855a',
      };
    }

    return baseStyle;
  };

  const getIcon = () => {
    switch (data.type) {
      case 'prompt':
        return '📝';
      default:
        return '⚡';
    }
  };

  const getTitle = () => {
    switch (data.type) {
      case 'prompt':
        return 'User Prompt';
      default:
        return 'Special Node';
    }
  };

  return (
    <div className="special-node" style={getNodeStyle()}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          background: '#fff',
          border: '2px solid #4a5568',
          width: '12px',
          height: '12px',
        }}
      />
      
      <div className="node-content">
        <div className="node-header">
          <div className="node-icon" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {getIcon()}
          </div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
            {getTitle()}
          </h4>
        </div>
        
        <div className="node-body">
          <div className="node-description" style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            {data.description || 'Special system node'}
          </div>
          {data.prompt && (
            <div className="node-prompt" style={{ 
              marginTop: '0.5rem', 
              padding: '0.5rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontStyle: 'italic'
            }}>
              "{data.prompt}"
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          background: '#fff',
          border: '2px solid #4a5568',
          width: '12px',
          height: '12px',
        }}
      />
    </div>
  );
};

export default SpecialNode; 