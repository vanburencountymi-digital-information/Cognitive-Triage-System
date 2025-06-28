# Edge Menu Feature

The Cognitive Triage System now includes an interactive edge menu that allows users to manage connections between AI agent nodes with ease.

## Features

### 🎯 Edge Selection
- **Click to Select**: Click on any edge to select it and open the edge menu
- **Visual Feedback**: Selected edges are highlighted in red with increased stroke width
- **Hover Effects**: Edges change appearance on hover for better user experience

### 🗑️ Edge Deletion
- **Menu Delete**: Click the "🗑️ Delete Edge" button in the edge menu
- **Keyboard Delete**: Press `Delete` or `Backspace` key when an edge is selected
- **Button Delete**: Use the "Delete Edge" button in the top-left control panel when an edge is selected

### 🔄 Edge Editing
- **Source Dropdown**: Change the source node of the edge using the dropdown menu
- **Target Dropdown**: Change the target node of the edge using the dropdown menu
- **Validation**: Prevents self-loops (source and target cannot be the same node)
- **Real-time Updates**: Changes are applied immediately and reflected in the graph

### 🎨 User Interface
- **Tooltip-style Menu**: Menu appears near the clicked edge position
- **Clean Design**: Modern, responsive design that matches the application theme
- **Keyboard Support**: Press `Escape` to close the menu
- **Click Outside**: Click anywhere outside the menu to close it
- **Smooth Animation**: Menu appears with a subtle fade-in animation

## How to Use

### Selecting an Edge
1. **Click on any edge** in the workflow graph
2. The edge will be highlighted in red
3. The edge menu will appear near the click position

### Deleting an Edge
**Option 1: Using the Menu**
1. Click on an edge to open the menu
2. Click the "🗑️ Delete Edge" button

**Option 2: Using the Keyboard**
1. Click on an edge to select it
2. Press `Delete` or `Backspace` key

**Option 3: Using the Control Panel**
1. Click on an edge to select it
2. Click the "Delete Edge" button in the top-left control panel

### Editing Edge Connections
1. Click on an edge to open the menu
2. Use the "Source Node" dropdown to change the source
3. Use the "Target Node" dropdown to change the target
4. The edge will automatically update to connect the new nodes

### Closing the Menu
- Click the "×" button in the top-right of the menu
- Press the `Escape` key
- Click anywhere outside the menu

## Technical Implementation

### Components
- **CustomEdge**: Main edge component with click handling and menu display
- **GraphCanvas**: Manages edge state and provides interaction handlers
- **CSS Animations**: Smooth transitions and responsive design

### State Management
- **Edge Selection**: Tracks which edge is currently selected
- **Menu State**: Manages menu visibility and positioning
- **Graph Updates**: Handles edge modifications and graph synchronization

### Event Handling
- **Click Events**: Edge selection and menu positioning
- **Keyboard Events**: Delete and escape key handling
- **Form Events**: Dropdown changes for source/target updates

## Benefits

1. **Improved Workflow Management**: Easy editing of agent connections
2. **Better User Experience**: Intuitive interface for edge manipulation
3. **Keyboard Accessibility**: Full keyboard support for power users
4. **Visual Feedback**: Clear indication of selected elements
5. **Error Prevention**: Validation prevents invalid edge configurations

## Future Enhancements

Potential improvements for the edge menu feature:
- **Edge Labels**: Add custom labels to edges
- **Edge Types**: Different edge styles for different connection types
- **Bulk Operations**: Select multiple edges for batch operations
- **Undo/Redo**: Support for undoing edge modifications
- **Edge Validation**: More sophisticated validation rules 