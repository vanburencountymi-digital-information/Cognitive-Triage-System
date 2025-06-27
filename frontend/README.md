# Cognitive Triage System - React Frontend

A modern React-based frontend for the Cognitive Triage System, providing a drag-and-drop interface for building AI agent workflows.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface using ReactFlow
- **Persona Management**: Create, edit, and manage AI agent personas
- **Real-time Graph Editing**: Add, connect, and configure workflow nodes
- **Special Nodes**: System-provided nodes like Prompt nodes for workflow inputs
- **Results Display**: View final outputs and individual step results
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

## Usage

### 1. Special Nodes (System Nodes)

The system automatically loads special nodes when you start the application. These appear at the top of the canvas with distinct green styling:

- **Prompt Node**: Represents the user input that will be processed by your workflow
- **Visual Distinction**: Green gradient background with 📝 icon
- **System Protection**: Cannot be deleted or moved (system-managed)
- **Connection Source**: Can connect to agent nodes to define workflow inputs

### 2. Select or Create Personas
- Use the left sidebar to browse existing personas
- Click "Create New" to add custom personas
- Each persona defines an AI agent's role, goal, and task

### 3. Build Your Workflow
- **Connect Prompt to Agents**: Draw edges from the prompt node to agent nodes
- Select a persona from the left panel
- Click "Add Node" to place agents in your workflow (appears in center of current view)
- Drag from node handles to create connections between agents
- Edit node personas by clicking the edit button on each node

### 4. Run the Workflow
- Enter your prompt in the text area at the top
- Click "Run Crew Workflow" to execute your AI agents
- View results in the right sidebar

### 5. View Results
- See the final polished output
- Browse individual step results using the tabs
- Copy results to clipboard with the copy buttons

## Node Types

### Agent Nodes (User-Created)
- **Purpose**: AI agents that process information
- **Creation**: Added via "Add Node" button
- **Styling**: White background with blue border
- **Management**: Can be edited, moved, and deleted
- **Requirements**: Must have a persona assigned

### Special Nodes (System-Provided)
- **Purpose**: System inputs and control nodes
- **Creation**: Automatically loaded from backend
- **Styling**: Green gradient background with icons
- **Management**: Cannot be deleted or moved
- **Examples**: Prompt nodes for user input

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.jsx      # Main workflow builder
│   │   ├── CustomNode.jsx       # Individual workflow nodes
│   │   ├── SpecialNode.jsx      # Special system nodes
│   │   ├── PersonaPanel.jsx     # Persona management
│   │   ├── RunButton.jsx        # Workflow execution
│   │   └── ResultsDisplay.jsx   # Results viewer
│   ├── api.js                   # API service layer
│   ├── App.jsx                  # Main application component
│   ├── App.css                  # Application styles
│   └── index.js                 # Application entry point
├── package.json
└── README.md
```

## API Integration

The frontend communicates with the Flask backend through the following endpoints:

- `GET /api/personas` - Fetch all personas
- `POST /api/personas` - Create new persona
- `PUT /api/personas/<name>` - Update existing persona
- `DELETE /api/personas/<name>` - Delete persona
- `GET /api/special-nodes` - Fetch special nodes (prompt nodes, etc.)
- `POST /api/run-crew-graph` - Execute workflow

## Key Components

### GraphCanvas
- Uses ReactFlow for the visual workflow builder
- Manages nodes and edges state
- Provides controls for adding, deleting, and clearing nodes
- Automatically loads and displays special nodes
- Implements viewport-aware node positioning

### SpecialNode
- Displays system-provided nodes with distinct styling
- Shows node type, description, and prompt content
- Provides connection handles for workflow integration
- Protected from deletion and modification

### PersonaPanel
- Displays list of available personas
- Handles persona creation, editing, and deletion
- Integrates with the backend API

### CustomNode
- Individual workflow nodes with persona information
- Inline editing capabilities
- Connection handles for workflow building

### RunButton
- Validates workflow before execution
- Handles API communication
- Shows loading states and error messages
- Validates agent nodes vs special nodes separately

### ResultsDisplay
- Tabbed interface for viewing results
- Copy-to-clipboard functionality
- Displays both final output and individual step results

## Workflow Building Tips

### Creating Effective Workflows
1. **Start with Prompt Node**: Connect the prompt node to your first agent
2. **Chain Agents**: Create logical flows from one agent to the next
3. **Use Appropriate Personas**: Select personas that match your workflow needs
4. **Test Connections**: Ensure all agents are properly connected

### Node Positioning
- New agent nodes appear in the center of your current viewport
- Special nodes are automatically positioned at the top
- Drag nodes to organize your workflow logically
- Use the minimap to navigate large workflows

### Validation
- All agent nodes must have personas assigned
- At least one agent node is required
- Special nodes are automatically validated
- Clear error messages guide you through issues

## Styling

The application uses:
- Bootstrap 5 for responsive layout and components
- Custom CSS for application-specific styling
- ReactFlow's built-in styles for the graph interface
- Gradient backgrounds and icons for special nodes

## Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Adding New Features

1. Create new components in `src/components/`
2. Add API methods to `src/api.js` if needed
3. Update the main App component to include new features
4. Add appropriate styling to `src/App.css`

## Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure the Flask backend is running on port 5000
2. **CORS Issues**: The backend should have CORS enabled for localhost:3000
3. **Node Dependencies**: Run `npm install` if you encounter module not found errors
4. **Special Nodes Not Loading**: Check backend `/api/special-nodes` endpoint
5. **Node Positioning Issues**: Check browser console for viewport debug logs

### Debug Mode

Enable React Developer Tools in your browser for component inspection and debugging.

## Contributing

1. Follow the existing code structure and naming conventions
2. Add appropriate error handling and loading states
3. Ensure responsive design works on mobile devices
4. Test API integration thoroughly
5. Consider special nodes when adding new features

## License

This project is part of the Cognitive Triage System and follows the same license terms.
