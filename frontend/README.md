# Cognitive Triage System - Frontend

A React-based frontend for building and managing AI agent workflows with drag-and-drop simplicity and intuitive context menus.

## 🚀 Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI agent workflows
- **Interactive Context Menus**: Dynamic menus that appear next to selected nodes and edges
- **Edge Management**: Click edges to edit connections with dropdown selectors
- **Persona Management**: Create, edit, and manage AI agent personas
- **System Management**: Save, load, and manage complete workflow configurations
- **Tabbed Interface**: Clean tab navigation between Personas and Systems management
- **Real-time Execution**: Run workflows and see results immediately
- **Special Nodes**: Built-in nodes like "User Prompt" for enhanced workflows
- **Blank Nodes**: Create nodes without personas and assign them later
- **Keyboard Support**: Full keyboard navigation and shortcuts

## 🎯 Interface Overview

### Main Layout
The interface is divided into three main sections:

#### 📋 Left Sidebar - Tabbed Management
The left sidebar features a clean tabbed interface for managing personas and systems:

**👥 Personas Tab**
- **View and Select Personas**: Browse all available AI agent personas
- **Create New Personas**: Build custom AI agents with specific roles and goals
- **Edit Existing Personas**: Modify persona details, roles, and tasks
- **Delete Personas**: Remove unwanted personas from your collection

**💾 Systems Tab**
- **Save Current Workflow**: Store your current workflow configuration with a name and description
- **Load Saved Systems**: Restore previously saved workflow configurations
- **Manage Systems**: Update or delete saved systems
- **System Statistics**: View the number of saved systems

#### 🎨 Center - Graph Canvas
The main workflow builder with interactive nodes and edges:

**Node Management**
- **Add Nodes**: Click "Add Node" to place agents in your workflow (no persona selection required)
- **Blank Nodes**: Create nodes without personas - they appear with a yellow border and "No persona selected" text
- **Assign Personas**: Click any node to open context menu and select a persona from the dropdown
- **Drag Nodes**: Move nodes around the canvas to organize your workflow
- **Select Nodes**: Click any node to see its context menu
- **Delete Nodes**: Use context menu or keyboard shortcuts

**Edge Management**
- **Create Connections**: Drag from one node's bottom handle to another's top handle
- **Select Edges**: Click any edge to see its context menu
- **Edit Connections**: Use dropdowns in edge context menu to change source/target
- **Delete Edges**: Use context menu, keyboard shortcuts, or control panel

**Control Panel (Top-Left)**
- **Add Node**: Add new agent nodes to the workflow (creates blank nodes if no persona selected)
- **Delete Node**: Remove selected node
- **Delete Edge**: Remove selected edge
- **Clear Agent Nodes**: Remove all agent nodes (keeps special nodes)

#### 📊 Right Sidebar - Results
- **Results Display**: Shows workflow execution results and intermediate outputs
- **Execution Status**: Real-time feedback on workflow progress

## 🎮 Interactive Context Menus

### Node Context Menu
When you click on a node, a context menu appears next to it with:

**For Custom Nodes (Agent Nodes):**
- **Node Information**: Displays the current persona name and role
- **Node Status**: Shows whether the node is "Assigned" or "Unassigned"
- **Persona Dropdown**: Change the persona assigned to this node (or assign one to blank nodes)
- **Delete Button**: Remove the node from the workflow

**For Special Nodes:**
- **Node Type**: Shows the special node type (e.g., "prompt")
- **Description**: Displays the node's description
- **Info Message**: Indicates that special nodes cannot be deleted

### Edge Context Menu
When you click on an edge, a context menu appears with:

- **Source Node Dropdown**: Change the source node of the connection
- **Target Node Dropdown**: Change the target node of the connection
- **Delete Button**: Remove the edge from the workflow

### Context Menu Features
- **Dynamic Positioning**: Menu appears next to the clicked item
- **Auto-Close**: Click anywhere else to close the menu
- **Keyboard Support**: Press `Escape` to close
- **Smooth Animations**: Fade-in effect when menu appears
- **Responsive Design**: Adapts to different screen sizes

## 🔧 System Management

The System Manager (accessible via the Systems tab) allows you to save and load complete workflow configurations:

### Saving Systems
1. Build your workflow using the graph canvas
2. Switch to the Systems tab in the left sidebar
3. Enter a name and optional description
4. Click "Save System"

### Loading Systems
1. Open the Systems tab
2. Select a system from the dropdown
3. Click "Load" to restore the workflow
4. Use "Delete" to remove unwanted systems

### Example Systems
The backend includes pre-built example systems:
- **Basic Customer Service**: Simple 2-agent workflow
- **Full Quality Assurance**: Complete 4-agent workflow
- **Direct Response**: Single agent for quick responses

To load examples, run the backend script: `python backend/load_examples.py`

## 🎯 Getting Started

1. **Start the backend server**: `python backend/app.py`
2. **Start the frontend**: `npm start`
3. **Open your browser**: Navigate to http://localhost:3000

## 📖 Usage Guide

### Building a Workflow
1. **Add Nodes**: Click "Add Node" to place agents in your workflow (creates blank nodes if no persona selected)
2. **Assign Personas**: Click nodes to open context menu and select personas from the dropdown
3. **Connect Nodes**: Drag from one node's bottom handle to another's top handle
4. **Edit Connections**: Click edges to modify source/target nodes via dropdowns
5. **Configure Nodes**: Click nodes to change personas via dropdown
6. **Save Workflow**: Use the Systems tab to save your configuration

### Running a Workflow
1. **Enter Prompt**: Type your question or request in the prompt field
2. **Validate Workflow**: The system will check that all nodes have personas assigned
3. **Run Workflow**: Click "Run Crew Workflow" to execute your AI agents
4. **View Results**: See the final output and individual step results on the right

### Managing Elements
- **Select Items**: Click any node or edge to select it
- **Delete Items**: Use context menu delete buttons or press `Delete` key
- **Edit Properties**: Use context menu dropdowns to modify settings
- **Close Menus**: Click elsewhere or press `Escape`

### Blank Nodes and Validation

The system supports creating nodes without personas assigned, providing flexibility in workflow design:

**Creating Blank Nodes**
- Click "Add Node" without selecting a persona first
- Blank nodes appear with a yellow border and "No persona selected" text
- They are visually distinct from assigned nodes for easy identification

**Assigning Personas to Blank Nodes**
- Click any blank node to open its context menu
- Use the persona dropdown to select an appropriate persona
- The node will immediately update to show the assigned persona

**Workflow Validation**
- Before running a workflow, the system validates that all nodes have personas assigned
- If any blank nodes are found, execution is blocked with a clear error message
- The error message lists the specific nodes that need personas assigned
- This prevents incomplete workflows from being executed

**Visual Indicators**
- **Assigned Nodes**: Blue border with persona name displayed
- **Blank Nodes**: Yellow border with "No persona selected" in italic text
- **Context Menu Status**: Shows "Assigned" or "Unassigned" status

## 🏗️ Components Architecture

### Core Components
- **GraphCanvas**: Main workflow builder with drag-and-drop functionality
- **ContextMenu**: Dynamic context menu for nodes and edges
- **CustomNode**: Individual node component with handles
- **CustomEdge**: Interactive edge component with click handling
- **TabPanel**: Tabbed interface for managing personas and systems
- **PersonaPanel**: Manage AI agent personas and configurations
- **SystemManager**: Save, load, and manage workflow systems
- **RunButton**: Execute workflows and handle results
- **ResultsDisplay**: Show workflow execution results and intermediate outputs

### State Management
- **Node Selection**: Tracks which node is currently selected
- **Edge Selection**: Tracks which edge is currently selected
- **Context Menu State**: Manages menu visibility and positioning
- **Graph State**: Manages nodes and edges in the workflow
- **Persona State**: Manages available personas for dropdowns

### Event Handling
- **Click Events**: Node/edge selection and context menu positioning
- **Keyboard Events**: Delete, escape, and other shortcuts
- **Drag Events**: Node movement and edge creation
- **Form Events**: Dropdown changes for configuration updates

## 🔌 API Integration

The frontend communicates with the Flask backend through REST APIs:
- **Persona Management**: CRUD operations for AI agent personas
- **System Management**: Save, load, update, and delete workflow systems
- **Workflow Execution**: Run AI agent workflows and get results
- **Special Nodes**: Get information about system nodes like "prompt"

## 🛠️ Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Key Technologies
- **React 18**: Modern React with hooks and functional components
- **ReactFlow**: Professional workflow builder library
- **Bootstrap 5**: Responsive UI framework
- **Axios**: HTTP client for API communication
- **CSS3**: Custom animations and responsive design

### Development Features
- **Hot Reloading**: Automatic refresh on code changes
- **ESLint**: Code quality and consistency
- **Build Optimization**: Production-ready builds with code splitting
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🎨 User Experience Features

### Visual Design
- **Clean Interface**: Minimal clutter, maximum functionality
- **Consistent Theming**: Unified color scheme and typography
- **Smooth Animations**: Subtle transitions and feedback
- **Responsive Layout**: Adapts to different screen sizes

### Interaction Design
- **Intuitive Controls**: Click, drag, and drop operations
- **Contextual Menus**: Actions appear where you need them
- **Keyboard Shortcuts**: Power user features for efficiency
- **Visual Feedback**: Clear indication of selections and states

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **High Contrast**: Readable text and clear visual hierarchy
- **Responsive Design**: Works across different devices and screen sizes

## 🚀 Future Enhancements

The current architecture provides a solid foundation for future improvements:

### Planned Features
- **Edge Labels**: Custom labels for edge connections
- **Edge Types**: Different styles for different connection types
- **Bulk Operations**: Select multiple items for batch operations
- **Undo/Redo**: Support for undoing modifications
- **Advanced Validation**: More sophisticated workflow validation

### Potential Improvements
- **Real-time Collaboration**: Multi-user workflow editing
- **Version Control**: Track changes and rollback capabilities
- **Template Library**: Pre-built workflow templates
- **Advanced Analytics**: Workflow performance metrics
- **Plugin System**: Extensible architecture for custom features

## 📚 Additional Documentation

For detailed information about specific features, see:
- [Edge Menu Feature](./EDGE_MENU_FEATURE.md) - Complete guide to edge management
- [Context Menu Improvement](./CONTEXT_MENU_IMPROVEMENT.md) - Details about the context menu system

---

The Cognitive Triage System frontend provides an intuitive and powerful interface for building AI agent workflows. The combination of drag-and-drop functionality, interactive context menus, and comprehensive management tools makes it easy to create, configure, and execute complex AI workflows.
