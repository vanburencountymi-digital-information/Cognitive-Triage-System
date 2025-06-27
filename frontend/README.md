# Cognitive Triage System - Frontend

A React-based frontend for building and managing AI agent workflows with drag-and-drop simplicity.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI agent workflows
- **Persona Management**: Create, edit, and manage AI agent personas
- **System Management**: Save, load, and manage complete workflow configurations
- **Real-time Execution**: Run workflows and see results immediately
- **Special Nodes**: Built-in nodes like "User Prompt" for enhanced workflows

## System Management

The System Manager component allows you to save and load complete workflow configurations:

### Saving Systems
1. Build your workflow using the graph canvas
2. Open the System Manager (left sidebar)
3. Enter a name and optional description
4. Click "Save System"

### Loading Systems
1. Open the System Manager
2. Select a system from the dropdown
3. Click "Load" to restore the workflow
4. Use "Delete" to remove unwanted systems

### Example Systems
The backend includes pre-built example systems:
- **Basic Customer Service**: Simple 2-agent workflow
- **Full Quality Assurance**: Complete 4-agent workflow
- **Direct Response**: Single agent for quick responses

To load examples, run the backend script: `python backend/load_examples.py`

## Getting Started

1. Start the backend server: `python backend/app.py`
2. Start the frontend: `npm start`
3. Open http://localhost:3000 in your browser

## Usage

1. **Select a Persona**: Choose from the left panel or create a new one
2. **Add Nodes**: Click "Add Node" to place agents in your workflow
3. **Connect Nodes**: Drag from one node's bottom handle to another's top handle
4. **Save Workflow**: Use the System Manager to save your configuration
5. **Enter Prompt**: Type your question or request in the prompt field
6. **Run Workflow**: Click "Run Crew Workflow" to execute your AI agents
7. **View Results**: See the final output and individual step results on the right

## Components

- **GraphCanvas**: Main workflow builder with drag-and-drop functionality
- **PersonaPanel**: Manage AI agent personas and configurations
- **SystemManager**: Save, load, and manage workflow systems
- **RunButton**: Execute workflows and handle results
- **ResultsDisplay**: Show workflow execution results and intermediate outputs

## API Integration

The frontend communicates with the Flask backend through REST APIs:
- Persona management endpoints
- System save/load endpoints
- Workflow execution endpoint
- Special nodes information

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Technologies

- React 18
- Bootstrap 5
- Axios for API communication
- Custom drag-and-drop implementation
