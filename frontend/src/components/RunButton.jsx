import React, { useState } from 'react';
import { apiService } from '../api';

const RunButton = ({ graphData, userPrompt, onResults }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const validateGraph = () => {
    if (!userPrompt || userPrompt.trim() === '') {
      return 'Please enter a user prompt';
    }

    if (!graphData.nodes || graphData.nodes.length === 0) {
      return 'Please add at least one node to the graph';
    }

    // Check if all nodes have personas
    const nodesWithoutPersonas = graphData.nodes.filter(node => !node.persona || node.persona.trim() === '');
    if (nodesWithoutPersonas.length > 0) {
      return 'All nodes must have personas assigned';
    }

    return null;
  };

  const handleRun = async () => {
    const validationError = validateGraph();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const results = await apiService.runCrewGraph(graphData, userPrompt);
      onResults(results);
    } catch (err) {
      console.error('Error running crew:', err);
      setError(err.response?.data?.error || err.message || 'Failed to run crew workflow');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="run-button-container">
      <button
        className={`btn btn-lg ${isRunning ? 'btn-secondary' : 'btn-success'}`}
        onClick={handleRun}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Running Crew...
          </>
        ) : (
          <>
            🚀 Run Crew Workflow
          </>
        )}
      </button>

      {error && (
        <div className="alert alert-danger mt-2">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isRunning && (
        <div className="alert alert-info mt-2">
          <strong>Processing...</strong> This may take a few moments as the AI agents work through your request.
        </div>
      )}
    </div>
  );
};

export default RunButton; 