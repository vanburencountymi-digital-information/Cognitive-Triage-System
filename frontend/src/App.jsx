import React, { useState, useCallback } from 'react';
import './App.css';
import GraphCanvas from './components/GraphCanvas';
import RunButton from './components/RunButton';
import ResultsDisplay from './components/ResultsDisplay';
import TabPanel from './components/TabPanel';
import SettingsPanel from './components/SettingsPanel';
import DebugPanel from './components/DebugPanel';

function App() {
  const [selectedPersona, setSelectedPersona] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [userPrompt, setUserPrompt] = useState('');
  const [results, setResults] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const handlePersonaSelect = useCallback((personaName) => {
    setSelectedPersona(personaName);
  }, []);

  const handleGraphChange = useCallback((newGraphData) => {
    setGraphData(newGraphData);
  }, []);

  const handleResults = useCallback((newResults) => {
    setResults(newResults);
  }, []);

  const handleClearResults = useCallback(() => {
    setResults(null);
  }, []);

  const handleLoadSystem = useCallback((systemGraph) => {
    setGraphData(systemGraph);
  }, []);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const openDebug = () => setIsDebugOpen(true);
  const closeDebug = () => setIsDebugOpen(false);

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>🧠 Cognitive Triage System</h1>
              <p>Build AI agent workflows with drag-and-drop simplicity</p>
            </div>
            <div className="header-right">
              <button 
                className="debug-button"
                onClick={openDebug}
                title="Debug Panel (Alpha)"
              >
                🔧 Debug
              </button>
              <button 
                className="settings-button"
                onClick={openSettings}
                title="Settings"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {/* User Prompt Section */}
          <div className="prompt-section">
            <div className="row">
              <div className="col-md-8">
                <div className="form-group">
                  <label htmlFor="userPrompt" className="form-label">
                    <strong>User Prompt</strong>
                  </label>
                  <textarea
                    id="userPrompt"
                    className="form-control"
                    rows="4"
                    placeholder="Enter your prompt here... The AI agents will process this through your workflow."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="run-section">
                  <RunButton
                    graphData={graphData}
                    userPrompt={userPrompt}
                    onResults={handleResults}
                  />
                  {results && (
                    <button
                      className="btn btn-outline-secondary mt-2"
                      onClick={handleClearResults}
                    >
                      Clear Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            <div className="row">
              {/* Left Sidebar - Tab Panel */}
              <div className="col-md-3">
                <div className="sidebar">
                  <TabPanel
                    selectedPersona={selectedPersona}
                    onPersonaSelect={handlePersonaSelect}
                    graphData={graphData}
                    onLoadSystem={handleLoadSystem}
                  />
                </div>
              </div>

              {/* Center - Graph Canvas */}
              <div className="col-md-6">
                <div className="graph-section">
                  <div className="graph-header">
                    <h3>Workflow Builder</h3>
                    <p>Drag nodes to connect them and build your AI agent workflow</p>
                  </div>
                  <div className="graph-container">
                    <GraphCanvas
                      onGraphChange={handleGraphChange}
                      selectedPersona={selectedPersona}
                      graphData={graphData}
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Results */}
              <div className="col-md-3">
                <div className="sidebar">
                  {results ? (
                    <ResultsDisplay results={results} />
                  ) : (
                    <div className="results-placeholder">
                      <h4>Results</h4>
                      <p>Run your workflow to see results here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h5>How to Use</h5>
                    <ol>
                      <li><strong>Select a Persona:</strong> Choose from the left panel or create a new one</li>
                      <li><strong>Add Nodes:</strong> Click "Add Node" to place agents in your workflow</li>
                      <li><strong>Connect Nodes:</strong> Drag from one node's bottom handle to another's top handle</li>
                      <li><strong>Enter Prompt:</strong> Type your question or request in the prompt field</li>
                      <li><strong>Run Workflow:</strong> Click "Run Crew Workflow" to execute your AI agents</li>
                      <li><strong>View Results:</strong> See the final output and individual step results on the right</li>
                    </ol>
                    <div className="alpha-notice">
                      <p><strong>🔧 Alpha Testing:</strong> If you encounter issues, use the Debug button in the header to run diagnostic tests and help identify problems.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />
      
      {/* Debug Panel */}
      <DebugPanel isOpen={isDebugOpen} onClose={closeDebug} />
    </div>
  );
}

export default App; 