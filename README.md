# Cognitive-Triage-System

This project is a proof of concept for a next-generation, agentic LLM system designed to support county administrators and decision makers. It provides nuanced, transparent, and bias-resistant responses to complex public sector questions, using a multi-agent workflow and a flexible persona system. The system is built with [crewAI](https://github.com/joaomdmoura/crewAI) and features both a modern React frontend and a Gradio interface.

## Architecture

The system is now split into two parts:

- **Backend** (`./backend/`): Flask API server with CrewAI integration
- **Frontend** (`./frontend/`): Modern React application with drag-and-drop workflow builder

## Why This System?

Large Language Models (LLMs) are powerful, but in government and policy settings, they are prone to amplifying confirmation bias, engagement bias, and context bias—especially when prompts are emotionally charged, ambiguous, or loaded. This system is designed to help county staff and administrators avoid these pitfalls by:
- Reframing questions to be clear and neutral
- Providing balanced, context-aware analysis
- Critiquing outputs for tone, completeness, and bias
- Delivering a transparent, step-by-step record of the reasoning process

## Features

### Core Features
- **Multi-Agent, Multi-Step Workflow:**
  - Each user prompt is processed by a sequence of specialized agents, each with a distinct role:
    1. **Prompt Reframer:** Neutralizes bias and clarifies the administrator's question.
    2. **Information Specialist:** Provides a thorough, plain-language response, drawing on policy, technical, and contextual knowledge.
    3. **Communication Analyst:** Critiques the response, surfacing strengths, weaknesses, missing perspectives, and potential issues with tone or clarity—without rewriting.
    4. **Final Editor:** Integrates the critique and the original response, producing a polished, user-ready message that addresses all identified issues.

- **Persona System:**
  - Each agent's configuration (role, goal, backstory, task description, expected output) is called a "persona."
  - Personas are saved to and loaded from a `personas.json` file, allowing persistent, reusable agent/task definitions.
  - Custom personas can be created for specialized workflows (e.g., strategic problem framing, critical report analysis, policy advising).

- **Transparent, Auditable Process:**
  - The interface displays the output of each step: the reframed prompt, the initial response, the analyst's critique, and the final edited message.
  - All agent configurations and outputs are visible and editable, supporting transparency and accountability in decision making.

### React Frontend Features
- **Visual Workflow Builder**: Drag-and-drop interface using ReactFlow
- **Real-time Graph Editing**: Add, connect, and configure workflow nodes
- **Persona Management**: Create, edit, and manage AI agent personas through a modern UI
- **Results Display**: View final outputs and individual step results with copy-to-clipboard functionality
- **Responsive Design**: Works on desktop and mobile devices

### Gradio Interface Features
- **Simple Interface**: Quick access to the core functionality
- **Persona Customization**: Edit and create personas through the interface
- **Instant Results**: See all steps and final output in one view

## Quick Start

### Option 1: React Frontend (Recommended)

1. **Start the Backend:**
   ```bash
   cd backend
   python app.py
   ```
   The backend will start on `http://localhost:5000`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The frontend will start on `http://localhost:3000`

3. **Use the Application:**
   - Open `http://localhost:3000` in your browser
   - Select or create personas in the left sidebar
   - Build your workflow by adding nodes and connecting them
   - Enter your prompt and run the workflow
   - View results in the right sidebar

### Option 2: Gradio Interface (Legacy)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Add your OpenAI API key:**
   - Create a file named `.env` in the project directory.
   - Add the following line to the file (replace `sk-...` with your actual key):
     ```
     OPENAI_API_KEY=sk-...
     ```

3. **Run the app:**
   ```bash
   python main.py
   ```

4. **Open the Gradio interface** (the URL will be shown in your terminal).

## How the Process Works

1. **Prompt Reframer:**
   - The initial question or concern from the administrator is reframed into a clear, neutral, and actionable prompt. This step helps surface and neutralize any implicit bias or emotional charge, ensuring the subsequent analysis is grounded and constructive.

2. **Information Specialist:**
   - This agent provides a thorough, plain-language response to the reframed prompt, drawing on policy, technical, and contextual knowledge. The response aims to be balanced and accessible, helping the administrator understand the issue from multiple angles.

3. **Communication Analyst:**
   - Rather than rewriting, this agent critiques the specialist's response. The critique highlights strengths, weaknesses, missing perspectives, and potential issues with tone, clarity, or completeness. This step is crucial for surfacing engagement and context biases, and for ensuring the response is robust before it is used in decision making or public communication.

4. **Final Editor:**
   - The final agent integrates the critique and the original response, producing a polished, user-ready message that addresses all identified issues. This ensures the final output is not only accurate and clear, but also contextually aware and free from common LLM pitfalls.

**Custom Personas:**
- The system supports custom personas for each agent role. For example, you might use a "Problem Framer" persona to break down a strategic question into sub-questions, a "Policy and Technology Advisor" to provide balanced analysis, or a "Critical Report Analyst" to surface assumptions and blind spots in a report. These personas can be tailored to the specific needs and values of your county or department.

**Result:**
- The administrator receives a transparent, step-by-step record of how their question was reframed, answered, critiqued, and finalized. This process helps avoid the most common LLM failure modes in government settings, supporting more nuanced, fair, and trustworthy decision making.

## Project Structure

```
Cognitive-Triage-System/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── personas.json          # Persona definitions
│   ├── requirements.txt       # Python dependencies
│   └── BACKEND_README.md      # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── api.js            # API service layer
│   │   ├── App.jsx           # Main application
│   │   └── App.css           # Application styles
│   ├── package.json          # Node.js dependencies
│   └── README.md             # Frontend documentation
├── main.py                   # Legacy Gradio interface
├── requirements.txt          # Legacy dependencies
└── README.md                # This file
```

## Requirements

### Backend Requirements
- Python 3.8+
- Flask
- crewai
- python-dotenv

### Frontend Requirements
- Node.js (v14 or higher)
- npm or yarn

## Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /health` - Health check
- `GET /api/personas` - Get all personas
- `POST /api/personas` - Create new persona
- `PUT /api/personas/<name>` - Update existing persona
- `DELETE /api/personas/<name>` - Delete persona
- `POST /api/run-crew-graph` - Execute workflow

## Development

### Backend Development
```bash
cd backend
python app.py
```

### Frontend Development
```bash
cd frontend
npm start
```

### Testing
```bash
# Backend tests
cd backend
python test_backend.py

# Frontend tests
cd frontend
npm test
```

## personas.json
- This file is automatically created and updated as you add or edit personas.
- Each persona contains all the information needed to configure an agent and its task.

---

This project demonstrates how agentic LLM systems can be made more robust, transparent, and user-configurable for real-world public sector applications.
