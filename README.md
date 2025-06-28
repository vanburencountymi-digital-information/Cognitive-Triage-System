# 🧠 Cognitive Triage System

A sophisticated AI agent workflow builder that allows you to create, save, and manage complex AI agent systems with drag-and-drop simplicity. Built with React frontend and Flask backend, powered by CrewAI.

## ✨ Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI agent workflows
- **System Management**: Save, load, and manage complete workflow configurations
- **Persona Management**: Create, edit, and manage AI agent personas
- **Real-time Execution**: Run workflows and see results immediately
- **Special Nodes**: Built-in nodes like "User Prompt" for enhanced workflows
- **Example Systems**: Pre-built workflow templates to get started quickly
- **API Key Management**: Secure user-specific API key management for OpenAI integration

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- **OpenAI API Key** (required for AI agent functionality)

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker Compose:

#### Multi-Container Setup (Development/Production)
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cognitive-Triage-System
   ```

2. **Start with Docker Compose**
   ```bash
   # Windows
   start_docker.bat
   
   # Linux/Mac
   docker-compose up --build
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Set up your API key**
   - Click the "⚙️ Settings" button in the header
   - Enter your OpenAI API key and click "Validate"
   - Save your API key for future use

5. **Stop the services**
   ```bash
   # Windows
   stop_docker.bat
   
   # Linux/Mac
   docker-compose down
   ```

#### Single-Container Setup (Railway/Heroku)
For deployment to Railway, Heroku, or other single-container platforms:

1. **Test locally**
   ```bash
   docker-compose -f docker-compose.single.yml up --build
   ```

2. **Deploy to Railway**
   - Connect your GitHub repository to Railway
   - Railway will automatically detect the `railway.json` configuration
   - The app will be available at your Railway URL

3. **Access the application**
   - Single URL serves both frontend and backend
   - API endpoints available at `/api/*`
   - Health check at `/health`

### Option 2: Manual Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cognitive-Triage-System
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Load example systems** (optional)
   ```bash
   cd backend
   python load_examples.py
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

6. **Set up your API key**
   - Click the "⚙️ Settings" button in the header
   - Enter your OpenAI API key and click "Validate"
   - Save your API key for future use

## 🔑 API Key Setup

### Getting Your OpenAI API Key

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Sign in or create account**: Create an OpenAI account if you don't have one
3. **Create API key**: Click "Create new secret key"
4. **Copy the key**: The key starts with "sk-" followed by a long string
5. **Set in app**: Paste the key in the Settings panel and click "Validate"

### Security Features

- **Local Storage**: Your API key is stored locally in your browser
- **Never Shared**: The key is never stored on our servers
- **Validation**: Keys are validated in real-time with OpenAI
- **Privacy**: Only used for your own workflow executions

## 📖 Usage Guide

### 1. Initial Setup

1. **Set API Key**: Click "⚙️ Settings" and enter your OpenAI API key
2. **Load Examples** (optional): Load pre-built workflow templates
3. **Create Personas**: Define AI agents with specific roles and goals

### 2. System Management

The System Manager (left sidebar) allows you to save and load complete workflow configurations:

#### Saving Systems
1. Build your workflow using the graph canvas
2. Open the System Manager (left sidebar)
3. Enter a name and optional description
4. Click "Save System"

#### Loading Systems
1. Open the System Manager
2. Select a system from the dropdown
3. Click "Load" to restore the workflow
4. Use "Delete" to remove unwanted systems

#### Example Systems
The backend includes pre-built example systems:
- **Basic Customer Service**: Simple 2-agent workflow
- **Full Quality Assurance**: Complete 4-agent workflow with all steps
- **Direct Response**: Single agent for quick responses

### 3. Building Workflows

1. **Select a Persona**: Choose from the left panel or create a new one
2. **Add Nodes**: Click "Add Node" to place agents in your workflow
3. **Connect Nodes**: Drag from one node's bottom handle to another's top handle
4. **Save Workflow**: Use the System Manager to save your configuration
5. **Enter Prompt**: Type your question or request in the prompt field
6. **Run Workflow**: Click "Run Crew Workflow" to execute your AI agents
7. **View Results**: See the final output and individual step results on the right

### 4. Special Nodes

The system automatically provides special nodes:
- **Prompt Node**: Represents user input that can be passed to any agent
- **Visual Distinction**: Green gradient background with icons
- **System Protection**: Cannot be deleted or moved
- **Connection Source**: Can connect to agent nodes to define workflow inputs

## 🏗️ Architecture

### Backend (Flask)
- **API Endpoints**: RESTful API for system management, persona management, and workflow execution
- **CrewAI Integration**: Powers the AI agent workflows
- **Data Persistence**: JSON-based storage for systems and personas
- **Special Nodes**: Built-in support for system nodes like "prompt"
- **API Key Management**: User-provided API key validation and usage

### Frontend (React)
- **GraphCanvas**: Main workflow builder with drag-and-drop functionality
- **SystemManager**: Save, load, and manage workflow systems
- **PersonaPanel**: Manage AI agent personas and configurations
- **RunButton**: Execute workflows and handle results
- **ResultsDisplay**: Show workflow execution results and intermediate outputs
- **SettingsPanel**: Manage user API keys and preferences

## 📁 Project Structure

```
Cognitive-Triage-System/
├── backend/
│   ├── app.py                 # Flask backend server
│   ├── personas.json          # Stored personas
│   ├── systems.json           # Stored systems
│   ├── example_systems.json   # Pre-built example systems
│   ├── load_examples.py       # Script to load examples
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphCanvas.jsx      # Main workflow builder
│   │   │   ├── SystemManager.jsx    # System save/load interface
│   │   │   ├── PersonaPanel.jsx     # Persona management
│   │   │   ├── RunButton.jsx        # Workflow execution
│   │   │   ├── ResultsDisplay.jsx   # Results viewer
│   │   │   └── SettingsPanel.jsx    # API key management
│   │   ├── api.js                   # API service layer
│   │   └── App.jsx                  # Main application
│   └── package.json                 # Node.js dependencies
└── README.md                        # This file
```

## 🔧 API Reference

### API Key Management
- `POST /api/validate-api-key` - Validate user-provided OpenAI API key

### System Management
- `GET /api/systems` - List all saved systems
- `POST /api/systems` - Save a new system
- `GET /api/systems/<name>` - Get a specific system
- `PUT /api/systems/<name>` - Update an existing system
- `DELETE /api/systems/<name>` - Delete a system

### Persona Management
- `GET /api/personas` - List all personas
- `POST /api/personas` - Create a new persona
- `PUT /api/personas/<name>` - Update a persona
- `DELETE /api/personas/<name>` - Delete a persona

### Workflow Execution
- `POST /api/run-crew-graph` - Execute a workflow with graph data, user prompt, and API key

### Special Nodes
- `GET /api/special-nodes` - Get information about special nodes

## 🧪 Testing

### Backend Tests
```bash
cd backend
python test_systems.py          # Test system management
python test_graph_loading.py    # Test graph loading functionality
```

### Frontend Tests
```bash
cd frontend
npm test                        # Run React tests
```

## 🚀 Deployment

### Docker Deployment (Recommended)

#### Multi-Container Setup
The easiest way to deploy the application is using Docker Compose:

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

2. **For production, use the production compose file**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

#### Single-Container Setup (Railway/Heroku)
For deployment to Railway, Heroku, or other single-container platforms:

1. **Deploy to Railway**
   - Connect your GitHub repository to Railway
   - Railway will automatically detect the `railway.json` configuration
   - The app will be available at your Railway URL

2. **Deploy to Heroku**
   ```bash
   heroku create your-app-name
   heroku container:push web
   heroku container:release web
   ```

3. **Access the application**
   - Single URL serves both frontend and backend
   - API endpoints available at `/api/*`
   - Health check at `/health`

### Backend Deployment
1. Set up a Python environment
2. Install dependencies: `pip install -r requirements.txt`
3. Configure environment variables
4. Run: `python app.py`

### Frontend Deployment
1. Build for production: `npm run build`
2. Serve the `build` directory with your web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **API Key Required**: Set your OpenAI API key in Settings (⚙️ button in header)
2. **Invalid API Key**: Ensure your key starts with "sk-" and is valid
3. **Backend Connection Error**: Ensure the Flask backend is running on port 5000
4. **CORS Issues**: The backend should have CORS enabled for localhost:3000
5. **Node Dependencies**: Run `npm install` if you encounter module not found errors
6. **Special Nodes Not Loading**: Check backend `/api/special-nodes` endpoint
7. **System Loading Issues**: Verify the backend is running and systems.json exists

### Debug Mode
Enable React Developer Tools in your browser for component inspection and debugging.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Open an issue on GitHub
