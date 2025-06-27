import React, { useState, useEffect } from 'react';
import { saveSystem, getSystems, getSystem, updateSystem, deleteSystem } from '../api';

const SystemManager = ({ graphData, onLoadSystem }) => {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [systemName, setSystemName] = useState('');
  const [systemDescription, setSystemDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load systems on component mount
  useEffect(() => {
    loadSystemsList();
  }, []);

  const loadSystemsList = async () => {
    try {
      const systemsList = await getSystems();
      setSystems(systemsList);
    } catch (error) {
      console.error('Error loading systems:', error);
      setMessage('Error loading systems');
    }
  };

  const handleSaveSystem = async () => {
    if (!systemName.trim()) {
      setMessage('Please enter a system name');
      return;
    }

    if (graphData.nodes.length === 0) {
      setMessage('Please add at least one node to save');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const systemData = {
        name: systemName.trim(),
        description: systemDescription.trim(),
        graph: graphData
      };

      // Check if system already exists
      const existingSystem = systems.find(s => s.name === systemName.trim());
      
      if (existingSystem) {
        // Update existing system
        await updateSystem(systemName.trim(), systemData);
        setMessage('System updated successfully!');
      } else {
        // Save new system
        await saveSystem(systemData);
        setMessage('System saved successfully!');
      }

      // Refresh systems list
      await loadSystemsList();
      
      // Clear form
      setSystemName('');
      setSystemDescription('');
      
    } catch (error) {
      console.error('Error saving system:', error);
      setMessage(error.message || 'Error saving system');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSystem = async () => {
    if (!selectedSystem) {
      setMessage('Please select a system to load');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const system = await getSystem(selectedSystem);
      onLoadSystem(system.graph);
      setMessage('System loaded successfully!');
    } catch (error) {
      console.error('Error loading system:', error);
      setMessage(error.message || 'Error loading system');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSystem = async () => {
    if (!selectedSystem) {
      setMessage('Please select a system to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${selectedSystem}"?`)) {
      return;
    }

    try {
      await deleteSystem(selectedSystem);
      setMessage('System deleted successfully!');
      setSelectedSystem('');
      await loadSystemsList();
    } catch (error) {
      console.error('Error deleting system:', error);
      setMessage(error.message || 'Error deleting system');
    }
  };

  const handleSystemSelect = (systemName) => {
    setSelectedSystem(systemName);
    // Auto-fill form with selected system data
    const system = systems.find(s => s.name === systemName);
    if (system) {
      setSystemName(system.name);
      setSystemDescription(system.description || '');
    }
  };

  return (
    <div className="system-manager">
      {/* Save System Section */}
      <div className="mb-4">
        <h6>Save Current Workflow</h6>
        <div className="form-group mb-2">
          <label className="form-label small">System Name</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="Enter system name..."
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label small">Description (optional)</label>
          <textarea
            className="form-control form-control-sm"
            rows="2"
            value={systemDescription}
            onChange={(e) => setSystemDescription(e.target.value)}
            placeholder="Describe this workflow..."
          />
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSaveSystem}
          disabled={isSaving || !systemName.trim()}
        >
          {isSaving ? 'Saving...' : 'Save System'}
        </button>
      </div>

      {/* Load System Section */}
      <div className="mb-4">
        <h6>Load Saved System</h6>
        <div className="form-group mb-2">
          <label className="form-label small">Select System</label>
          <select
            className="form-select form-select-sm"
            value={selectedSystem}
            onChange={(e) => handleSystemSelect(e.target.value)}
          >
            <option value="">Choose a system...</option>
            {systems.map((system) => (
              <option key={system.name} value={system.name}>
                {system.name}
              </option>
            ))}
          </select>
        </div>
        {selectedSystem && (
          <div className="mb-3">
            <small className="text-muted">
              {systems.find(s => s.name === selectedSystem)?.description || 'No description'}
            </small>
          </div>
        )}
        <div className="btn-group btn-group-sm">
          <button
            className="btn btn-outline-primary"
            onClick={handleLoadSystem}
            disabled={isLoading || !selectedSystem}
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={handleDeleteSystem}
            disabled={!selectedSystem}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`alert alert-${message.includes('Error') ? 'danger' : 'success'} alert-sm`}>
          {message}
        </div>
      )}

      {/* System Stats */}
      {systems.length > 0 && (
        <div className="mt-3">
          <small className="text-muted">
            {systems.length} saved system{systems.length !== 1 ? 's' : ''}
          </small>
        </div>
      )}
    </div>
  );
};

export default SystemManager; 