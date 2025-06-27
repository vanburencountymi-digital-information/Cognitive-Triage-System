# Cognitive Triage System - React Frontend

A modern React-based frontend for the Cognitive Triage System, providing a drag-and-drop interface for building AI agent workflows.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface using ReactFlow
- **Persona Management**: Create, edit, and manage AI agent personas
- **Real-time Graph Editing**: Add, connect, and configure workflow nodes
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

### 1. Select or Create Personas
- Use the left sidebar to browse existing personas
- Click "Create New" to add custom personas
- Each persona defines an AI agent's role, goal, and task

### 2. Build Your Workflow
- Select a persona from the left panel
- Click "Add Node" to place agents in your workflow
- Drag from node handles to create connections between agents
- Edit node personas by clicking the edit button on each node

### 3. Run the Workflow
- Enter your prompt in the text area at the top
- Click "Run Crew Workflow" to execute your AI agents
- View results in the right sidebar

### 4. View Results
- See the final polished output
- Browse individual step results using the tabs
- Copy results to clipboard with the copy buttons

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.jsx      # Main workflow builder
│   │   ├── CustomNode.jsx       # Individual workflow nodes
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
- `POST /api/run-crew-graph` - Execute workflow

## Key Components

### GraphCanvas
- Uses ReactFlow for the visual workflow builder
- Manages nodes and edges state
- Provides controls for adding, deleting, and clearing nodes

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

### ResultsDisplay
- Tabbed interface for viewing results
- Copy-to-clipboard functionality
- Displays both final output and individual step results

## Styling

The application uses:
- Bootstrap 5 for responsive layout and components
- Custom CSS for application-specific styling
- ReactFlow's built-in styles for the graph interface

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

### Debug Mode

Enable React Developer Tools in your browser for component inspection and debugging.

## Contributing

1. Follow the existing code structure and naming conventions
2. Add appropriate error handling and loading states
3. Ensure responsive design works on mobile devices
4. Test API integration thoroughly

## License

This project is part of the Cognitive Triage System and follows the same license terms.
