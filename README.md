# 🧠 Cognitive Triage System

A sophisticated AI agent workflow builder that allows you to create, save, and manage complex AI agent systems with drag-and-drop simplicity. Built with React frontend and Flask backend, powered by CrewAI.

## ✨ Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI agent workflows
- **System Management**: Save, load, and manage complete workflow configurations
- **Persona Management**: Create, edit, and manage AI agent personas
- **Real-time Execution**: Run workflows and see results immediately
- **Special Nodes**: Built-in nodes like "User Prompt" for enhanced workflows
- **Example Systems**: Pre-built workflow templates to get started quickly
- **🔐 Enhanced API Key Security**: Military-grade encryption with passphrase protection and session management

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

4. **Set up your API key securely**
   - Click the "⚙️ Settings" button in the header
   - Enter a security passphrase (protects your API key)
   - Enter your OpenAI API key and click "Validate & Store"
   - Your API key is now encrypted and protected

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

6. **Set up your API key securely**
   - Click the "⚙️ Settings" button in the header
   - Enter a security passphrase (protects your API key)
   - Enter your OpenAI API key and click "Validate & Store"
   - Your API key is now encrypted and protected

## 🔑 API Key Setup & Security

### Getting Your OpenAI API Key

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Sign in or create account**: Create an OpenAI account if you don't have one
3. **Create API key**: Click "Create new secret key"
4. **Copy the key**: The key starts with "sk-" followed by a long string
5. **Set in app**: Enter your passphrase and API key in the Settings panel

### 🔐 Enhanced Security Features

The system implements military-grade security for your API keys:

#### **Passphrase-Based Protection**
- **🔑 PBKDF2 Key Derivation**: Your passphrase is converted to a strong encryption key using 100,000 iterations
- **🔒 AES-256-GCM Encryption**: Military-grade encryption for your API key
- **🚫 No Key Storage**: The encryption key is never stored - only derived from your passphrase

#### **Session Management**
- **⏰ 8-Hour Sessions**: Security sessions expire automatically for protection
- **🔄 Automatic Cleanup**: Sensitive data is cleared when sessions expire
- **📱 Cross-Tab Security**: Sessions work across browser tabs but expire together

#### **Memory Protection**
- **🧹 Secure Clearing**: Sensitive data is overwritten in memory after use
- **🔒 Memory Safety**: Decrypted API keys only exist in memory during API calls
- **🛡️ Corruption Protection**: Automatic cleanup of corrupted encrypted data

#### **Security Architecture**
```
User Passphrase → PBKDF2(100k iterations) → Encryption Key → AES-256-GCM → Encrypted API Key
                                                                    ↓
                                                            Stored in localStorage
                                                                    ↓
                                                            Decrypted only when needed
```

### Security Level & Protection

**This implementation provides protection against:**
- ✅ **Browser inspection** - API key is encrypted, not plain text
- ✅ **localStorage access** - Requires passphrase to decrypt
- ✅ **Malware scanning** - Encrypted data appears as random bytes
- ✅ **Accidental exposure** - No plain text API keys in storage
- ✅ **Basic attacks** - PBKDF2 makes brute force extremely slow

**Security limitations:**
- ⚠️ **Advanced debugging** - Sophisticated tools can still access decrypted data
- ⚠️ **Malicious extensions** - Browser extensions can access page data
- ⚠️ **Physical access** - Someone with device access can potentially extract keys
- ⚠️ **Keyloggers** - Can capture passphrase input

**For maximum security:**
- Use only on trusted devices
- Never share your passphrase
- Clear data when using shared computers
- Consider server-side storage for enterprise use

## 📖 Usage Guide

### 1. Initial Setup

1. **Set Security Passphrase**: Click "⚙️ Settings" and enter a strong passphrase
2. **Enter API Key**: Provide your OpenAI API key for validation
3. **Load Examples** (optional): Load pre-built workflow templates
4. **Create Personas**: Define AI agents with specific roles and goals

### 2. Session Management

The system automatically manages security sessions:

- **Session Duration**: 8 hours from initialization
- **Session Status**: Visible in Settings panel
- **Session Expiry**: Automatic logout when expired
- **Re-authentication**: Re-enter passphrase to continue

### 3. System Management

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

### 4. Building Workflows

1. **Select a Persona**: Choose from the left panel or create a new one
2. **Add Nodes**: Click "Add Node" to place agents in your workflow
3. **Connect Nodes**: Drag from one node's bottom handle to another's top handle
4. **Save Workflow**: Use the System Manager to save your configuration
5. **Enter Prompt**: Type your question or request in the prompt field
6. **Run Workflow**: Click "Run Crew Workflow" to execute your AI agents
7. **View Results**: See the final output and individual step results on the right

### 5. Special Nodes

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
- **API Key Validation**: Server-side validation of user-provided API keys

### Frontend (React)
- **GraphCanvas**: Main workflow builder with drag-and-drop functionality
- **SystemManager**: Save, load, and manage workflow systems
- **PersonaPanel**: Manage AI agent personas and configurations
- **RunButton**: Execute workflows and handle results
- **ResultsDisplay**: Show workflow execution results and intermediate outputs
- **SecureSettingsPanel**: Enhanced API key management with passphrase protection

### Security Layer
- **Advanced Encryption**: PBKDF2 + AES-256-GCM encryption system
- **Session Management**: Time-based session expiry and cleanup
- **Memory Protection**: Secure clearing of sensitive data
- **Error Handling**: Graceful handling of security failures

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
│   │   │   ├── GraphCanvas.jsx           # Main workflow builder
│   │   │   ├── SystemManager.jsx         # System save/load interface
│   │   │   ├── PersonaPanel.jsx          # Persona management
│   │   │   ├── RunButton.jsx             # Workflow execution
│   │   │   ├── ResultsDisplay.jsx        # Results viewer
│   │   │   ├── SettingsPanel.jsx         # Basic API key management
│   │   │   └── SecureSettingsPanel.jsx   # Enhanced security settings
│   │   ├── utils/
│   │   │   ├── encryption.js             # Basic encryption utilities
│   │   │   └── advanced-encryption.js    # Enhanced security system
│   │   ├── api.js                        # Basic API service
│   │   ├── secure-api.js                 # Secure API service
│   │   └── App.jsx                       # Main application
│   └── package.json                      # Node.js dependencies
├── SECURITY_COMPARISON.md                # Security analysis document
└── README.md                             # This file
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

### Security Testing
```bash
# Test encryption in browser console
cd frontend
npm start
# Open browser console and run: testEncryption()
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

1. **Session Expired**: Re-enter your passphrase in Settings to continue
2. **API Key Required**: Set your OpenAI API key in Settings (⚙️ button in header)
3. **Invalid API Key**: Ensure your key starts with "sk-" and is valid
4. **Backend Connection Error**: Ensure the Flask backend is running on port 5000
5. **CORS Issues**: The backend should have CORS enabled for localhost:3000
6. **Node Dependencies**: Run `npm install` if you encounter module not found errors
7. **Special Nodes Not Loading**: Check backend `/api/special-nodes` endpoint
8. **System Loading Issues**: Verify the backend is running and systems.json exists

### Security Issues

1. **Passphrase Forgotten**: Clear all data and re-enter your API key
2. **Session Problems**: Check session status in Settings panel
3. **Encryption Errors**: Clear browser data and re-initialize
4. **Memory Issues**: Refresh the page to clear sensitive data

### Debug Mode
Enable React Developer Tools in your browser for component inspection and debugging.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the security documentation in `SECURITY_COMPARISON.md`
3. Review the API documentation
4. Open an issue on GitHub

## 🐞 Development Troubleshooting Note

If you are using the two-container Docker Compose setup for development and do not see any personas or systems in the frontend:

- Ensure that `backend/personas.json` and `backend/systems.json` exist and are populated with data. You can (re-)initialize them by running:
  ```bash
  python backend/init_data.py
  ```
- The backend may take a few seconds to start up. If API endpoints return 404 or empty results immediately after starting, wait a moment and try again.
- If you still have issues, check the backend container logs for errors:
  ```bash
  docker logs cognitive-triage-system-backend-1
  ```
