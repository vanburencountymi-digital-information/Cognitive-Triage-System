import React, { useState } from 'react';

const ResultsDisplay = ({ results }) => {
  const [activeTab, setActiveTab] = useState('final');

  if (!results) {
    return null;
  }

  const { final, steps } = results;
  const stepIds = Object.keys(steps || {});

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="results-display">
      <div className="results-header">
        <h3>🎯 Crew Results</h3>
        <div className="results-tabs">
          <button
            className={`btn btn-sm ${activeTab === 'final' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('final')}
          >
            Final Output
          </button>
          {stepIds.map((stepId) => (
            <button
              key={stepId}
              className={`btn btn-sm ${activeTab === stepId ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab(stepId)}
            >
              {steps[stepId].persona || stepId}
            </button>
          ))}
        </div>
      </div>

      <div className="results-content">
        {activeTab === 'final' ? (
          <div className="result-panel">
            <div className="result-header">
              <h4>Final Polished Output</h4>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => copyToClipboard(final)}
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
            <div className="result-body">
              <pre className="result-text">{final}</pre>
            </div>
          </div>
        ) : (
          <div className="result-panel">
            <div className="result-header">
              <h4>Step: {steps[activeTab].persona}</h4>
              <div className="step-info">
                <span className="badge bg-secondary">{steps[activeTab].role || 'Agent'}</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => copyToClipboard(steps[activeTab].output)}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
            </div>
            <div className="result-body">
              <pre className="result-text">{steps[activeTab].output}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="results-summary">
        <div className="summary-item">
          <strong>Total Steps:</strong> {stepIds.length + 1}
        </div>
        <div className="summary-item">
          <strong>Workflow:</strong> {stepIds.map(id => steps[id].persona).join(' → ')} → Final
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 