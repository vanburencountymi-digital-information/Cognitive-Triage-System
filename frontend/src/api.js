import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Personas
  getPersonas: async () => {
    const response = await api.get('/api/personas');
    return response.data;
  },

  createPersona: async (personaData) => {
    const response = await api.post('/api/personas', personaData);
    return response.data;
  },

  updatePersona: async (name, personaData) => {
    const response = await api.put(`/api/personas/${encodeURIComponent(name)}`, personaData);
    return response.data;
  },

  deletePersona: async (name) => {
    const response = await api.delete(`/api/personas/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Special nodes
  getSpecialNodes: async () => {
    const response = await api.get('/api/special-nodes');
    return response.data;
  },

  // Crew execution
  runCrewGraph: async (graphData, userPrompt) => {
    const payload = {
      graph: graphData,
      user_prompt: userPrompt
    };
    const response = await api.post('/api/run-crew-graph', payload);
    return response.data;
  },

  // Systems
  getSystems: async () => {
    const response = await api.get('/api/systems');
    return response.data;
  },

  saveSystem: async (systemData) => {
    const response = await api.post('/api/systems', systemData);
    return response.data;
  },

  getSystem: async (name) => {
    const response = await api.get(`/api/systems/${encodeURIComponent(name)}`);
    return response.data;
  },

  updateSystem: async (name, systemData) => {
    const response = await api.put(`/api/systems/${encodeURIComponent(name)}`, systemData);
    return response.data;
  },

  deleteSystem: async (name) => {
    const response = await api.delete(`/api/systems/${encodeURIComponent(name)}`);
    return response.data;
  },
};

export default api;

// Individual exports for easier importing
export const {
  healthCheck,
  getPersonas,
  createPersona,
  updatePersona,
  deletePersona,
  getSpecialNodes,
  runCrewGraph,
  getSystems,
  saveSystem,
  getSystem,
  updateSystem,
  deleteSystem,
} = apiService; 