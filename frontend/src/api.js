import axios from 'axios';

// Create axios instance with base configuration
// Use relative URLs for production compatibility
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get user API key
const getUserApiKey = () => {
  return localStorage.getItem('userApiKey');
};

// Helper function to check if user has API key
const hasUserApiKey = () => {
  return !!getUserApiKey();
};

// API methods
export const apiService = {
  // API Key management
  validateApiKey: async (apiKey) => {
    const response = await api.post('/api/validate-api-key', { apiKey });
    return response.data;
  },

  hasApiKey: hasUserApiKey,
  getUserApiKey: getUserApiKey,

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
    const userApiKey = getUserApiKey();
    if (!userApiKey) {
      throw new Error('API key is required. Please set your API key in Settings.');
    }

    const payload = {
      graph: graphData,
      user_prompt: userPrompt,
      user_api_key: userApiKey
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
  validateApiKey,
  hasApiKey,
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