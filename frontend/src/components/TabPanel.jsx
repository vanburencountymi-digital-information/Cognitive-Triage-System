import React, { useState } from 'react';
import PersonaPanel from './PersonaPanel';
import SystemManager from './SystemManager';

const TabPanel = ({ 
  selectedPersona, 
  onPersonaSelect, 
  graphData, 
  onLoadSystem 
}) => {
  const [activeTab, setActiveTab] = useState('personas');

  const tabs = [
    {
      id: 'personas',
      label: '👥 Personas',
      icon: '👥',
      component: (
        <PersonaPanel
          selectedPersona={selectedPersona}
          onPersonaSelect={onPersonaSelect}
        />
      )
    },
    {
      id: 'systems',
      label: '💾 Systems',
      icon: '💾',
      component: (
        <SystemManager
          graphData={graphData}
          onLoadSystem={onLoadSystem}
        />
      )
    }
  ];

  return (
    <div className="tab-panel">
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            {tabs.map((tab) => (
              <li className="nav-item" key={tab.id} role="presentation">
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          <div className="tab-content">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab-pane ${activeTab === tab.id ? 'active' : ''}`}
                role="tabpanel"
              >
                {tab.component}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabPanel; 