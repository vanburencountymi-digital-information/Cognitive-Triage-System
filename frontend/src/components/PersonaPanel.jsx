import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api';

const PersonaPanel = ({ selectedPersona, onPersonaSelect }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPersona, setEditingPersona] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating/editing personas
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    goal: '',
    backstory: '',
    taskDescription: '',
    expectedOutput: ''
  });

  // Memoize loadPersonas to prevent infinite re-renders
  const loadPersonas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getPersonas();
      setPersonas(data);
      setError(null);
    } catch (err) {
      setError('Failed to load personas');
      console.error('Error loading personas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const handlePersonaSelect = useCallback((personaName) => {
    onPersonaSelect(personaName);
  }, [onPersonaSelect]);

  const handleEditPersona = useCallback((persona) => {
    setEditingPersona(persona);
    setFormData({
      name: persona.name,
      role: persona.agent.role,
      goal: persona.agent.goal,
      backstory: persona.agent.backstory,
      taskDescription: persona.task.description,
      expectedOutput: persona.task.expected_output
    });
    setShowCreateForm(true);
  }, []);

  const handleCreatePersona = useCallback(() => {
    setEditingPersona(null);
    setFormData({
      name: '',
      role: '',
      goal: '',
      backstory: '',
      taskDescription: '',
      expectedOutput: ''
    });
    setShowCreateForm(true);
  }, []);

  const handleSavePersona = useCallback(async () => {
    try {
      const personaData = {
        name: formData.name,
        agent: {
          role: formData.role,
          goal: formData.goal,
          backstory: formData.backstory
        },
        task: {
          description: formData.taskDescription,
          expected_output: formData.expectedOutput
        }
      };

      if (editingPersona) {
        await apiService.updatePersona(editingPersona.name, personaData);
      } else {
        await apiService.createPersona(personaData);
      }

      await loadPersonas();
      setShowCreateForm(false);
      setEditingPersona(null);
      
      // Update the selected persona if it was the one being edited
      if (editingPersona && selectedPersona === editingPersona.name) {
        onPersonaSelect(formData.name);
      }
    } catch (err) {
      setError('Failed to save persona');
      console.error('Error saving persona:', err);
    }
  }, [formData, editingPersona, selectedPersona, onPersonaSelect, loadPersonas]);

  const handleDeletePersona = useCallback(async (personaName) => {
    if (window.confirm(`Are you sure you want to delete "${personaName}"?`)) {
      try {
        await apiService.deletePersona(personaName);
        await loadPersonas();
        
        // Clear selection if deleted persona was selected
        if (selectedPersona === personaName) {
          onPersonaSelect('');
        }
      } catch (err) {
        setError('Failed to delete persona');
        console.error('Error deleting persona:', err);
      }
    }
  }, [selectedPersona, onPersonaSelect, loadPersonas]);

  if (loading) {
    return <div className="persona-panel">Loading personas...</div>;
  }

  return (
    <div className="persona-panel">
      <div className="persona-panel-header">
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleCreatePersona}
        >
          Create New
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-sm">
          {error}
        </div>
      )}

      <div className="persona-list">
        {personas.map((persona) => (
          <div 
            key={persona.name} 
            className={`persona-item ${selectedPersona === persona.name ? 'selected' : ''}`}
          >
            <div className="persona-info">
              <h6 className="mb-1">{persona.name}</h6>
              <p className="persona-role mb-2">{persona.agent.role}</p>
            </div>
            <div className="persona-actions">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handlePersonaSelect(persona.name)}
              >
                Select
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleEditPersona(persona)}
              >
                Edit
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeletePersona(persona.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div className="persona-form-overlay">
          <div className="persona-form">
            <h4>{editingPersona ? 'Edit Persona' : 'Create New Persona'}</h4>
            
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Role:</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Goal:</label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Backstory:</label>
              <textarea
                value={formData.backstory}
                onChange={(e) => setFormData({...formData, backstory: e.target.value})}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Task Description:</label>
              <textarea
                value={formData.taskDescription}
                onChange={(e) => setFormData({...formData, taskDescription: e.target.value})}
                className="form-control"
                rows="3"
                placeholder="Use {user_prompt} as placeholder for user input"
              />
            </div>

            <div className="form-group">
              <label>Expected Output:</label>
              <textarea
                value={formData.expectedOutput}
                onChange={(e) => setFormData({...formData, expectedOutput: e.target.value})}
                className="form-control"
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleSavePersona}
              >
                {editingPersona ? 'Update' : 'Create'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaPanel; 