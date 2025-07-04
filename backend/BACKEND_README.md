# Cognitive Triage System - Flask Backend

This Flask backend provides a REST API for the Cognitive Triage System, separating the CrewAI logic from the frontend interface.

## Overview

The backend manages:
- **Personas**: AI agent definitions with roles, goals, and tasks
- **Crew Execution**: Dynamic creation and execution of AI agent workflows
- **Graph-based Workflows**: Flexible agent collaboration patterns
- **API Key Management**: User-provided OpenAI API key validation and usage
- **Workflow Validation**: Ensures all nodes have personas assigned before execution

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
# From backend directory
python app.py

# Or from project root
python backend/app.py
```

The server will start on `http://localhost:5000`

## API Key Management

The backend now supports user-provided API keys for enhanced security and privacy:

- **No Environment Variables**: Users provide their own OpenAI API keys
- **Real-time Validation**: API keys are validated with OpenAI before use
- **Secure Usage**: Keys are only used for workflow execution, never stored

### API Key Validation Endpoint

- **POST** `/api/validate-api-key`
- Body:
```json
{
  "apiKey": "sk-your-openai-api-key-here"
}
```
- Returns:
```json
{
  "message": "API key is valid",
  "valid": true
}
```

## CORS Configuration

The backend has CORS enabled for all origins, making it ready for frontend integration:
```python
CORS(app)  # Enable CORS for all routes
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status
- Response: `{"status": "healthy", "service": "Cognitive Triage System API"}`

### API Key Management
- **POST** `/api/validate-api-key`
- Validates user-provided OpenAI API key
- Returns validation status and message

### Special Nodes
- **GET** `/api/special-nodes`
- Returns information about special nodes that are always available
- Use this to populate the frontend with system nodes like "prompt"
- Response: Array of special node definitions

Example response:
```json
[
  {
    "id": "prompt",
    "name": "User Prompt", 
    "description": "The original user input that can be passed to any agent",
    "type": "prompt",
    "role": "Input Source"
  }
]
```

### System Management

#### Get All Systems
- **GET** `/api/systems`
- Returns: Array of saved system configurations
- Use this to populate a list of available systems in the frontend

#### Save System
- **POST** `/api/systems`
- Body:
```json
{
  "name": "System Name",
  "description": "Optional description of the system",
  "graph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

#### Get Specific System
- **GET** `/api/systems/<name>`
- Returns: Specific system configuration
- Use this to load a saved system into the frontend

#### Update System
- **PUT** `/api/systems/<name>`
- Body: Same as save system (all fields optional for update)

#### Delete System
- **DELETE** `/api/systems/<name>`
- Removes a saved system

### Example Systems

The backend includes example system configurations in `example_systems.json` that demonstrate different workflow patterns:

1. **Basic Customer Service** - Simple 2-agent workflow
2. **Full Quality Assurance** - Complete 4-agent workflow with all steps
3. **Direct Response** - Single agent for quick responses

To load these examples, you can copy them to `systems.json` or use the API to save them individually.

### Personas Management

#### Get All Personas
- **GET** `/api/personas`
- Returns: Array of persona definitions
- Use this to populate persona selection dropdowns in the frontend

#### Create Persona
- **POST** `/api/personas`
- Body:
```json
{
  "name": "Persona Name",
  "agent": {
    "role": "Agent Role",
    "goal": "Agent Goal",
    "backstory": "Agent Backstory"
  },
  "task": {
    "description": "Task description with {user_prompt} placeholder",
    "expected_output": "Expected output format"
  }
}
```

#### Update Persona
- **PUT** `/api/personas/<name>`
- Body: Same as create persona

#### Delete Persona
- **DELETE** `/api/personas/<name>`

### Crew Execution

#### Run Crew Graph
- **POST** `/api/run-crew-graph`
- Body:
```json
{
  "graph": {
    "nodes": [
      {
        "id": "node1",
        "persona": "Persona Name",
        "role": "Optional Role"
      }
    ],
    "edges": [
      {
        "source": "node1",
        "target": "node2"
      }
    ]
  },
  "user_prompt": "User input text",
  "user_api_key": "sk-your-openai-api-key-here"
}
```

- Returns:
```json
{
  "final": "Final crew output",
  "steps": {
    "node1": {
      "output": "Step output",
      "persona": "Persona Name",
      "role": "Role"
    }
  }
}
```

**Note**: The `user_api_key` field is now required for all crew executions. The backend will use this key for all OpenAI API calls during the workflow execution.

## Graph Structure

The graph defines how agents work together:

- **Nodes**: Each node represents an agent/task with a specific persona
- **Edges**: Define dependencies between tasks (source → target)
- **Execution**: Tasks are executed sequentially based on dependencies
- **Validation**: All nodes must have personas assigned before execution

### Node Requirements

Each node in the graph must have:
- **id**: Unique identifier for the node
- **persona**: Name of the persona to use (cannot be empty or blank)
- **role**: Optional role description

### Blank Node Validation

The backend validates that all nodes have personas assigned before executing workflows:

- **Pre-execution Check**: Before creating agents and tasks, the system checks all nodes
- **Blank Node Detection**: Nodes with empty or missing personas are identified
- **Clear Error Messages**: If blank nodes are found, execution is blocked with a detailed error
- **Node Listing**: The error message includes the specific node IDs that need personas assigned

Example validation error:
```json
{
  "error": "Cannot run workflow: 2 node(s) without personas assigned (node1, node2). Please assign personas to all nodes before running."
}
```

### Special Prompt Node

The system automatically includes a special "prompt" node that represents the user's original input. This allows you to:

- **Pass the original prompt** to any agent that needs it
- **Combine prompt context** with outputs from other agents
- **Maintain the original user intent** throughout the workflow

#### Using the Prompt Node

To give an agent access to the original user prompt, create an edge from "prompt" to that agent:

```json
{
  "source": "prompt",
  "target": "agent_id"
}
```

#### Multiple Context Sources

An agent can receive context from multiple sources:
- **Original prompt**: Edge from "prompt" 
- **Other agents**: Edges from other agent nodes
- **Combined context**: Both prompt and agent outputs

Example: A final editor that gets both the original prompt and a critique:
```json
{
  "edges": [
    {"source": "prompt", "target": "final_editor"},
    {"source": "critic", "target": "final_editor"}
  ]
}
```

### Frontend Integration Tips

When building the frontend, consider:

1. **Persona Selection**: Use `/api/personas` to populate dropdowns for graph node configuration
2. **Prompt Node**: Always include the "prompt" node in your graph UI (it's automatically available)
3. **Edge Creation**: Allow users to draw edges from "prompt" to any agent that needs the original context
4. **Real-time Updates**: The crew execution can take time - implement loading states
5. **Error Handling**: Handle 400/500 errors gracefully with user-friendly messages
6. **Graph Validation**: Ensure all referenced personas exist before sending requests

## Testing

Run the test script to verify the API:
```bash
python test_backend.py
```

For simple testing:
```bash
python simple_test.py
```

## Example Usage

### Simple 4-Node Graph (Original System) - Updated with Prompt Context
```json
{
  "graph": {
    "nodes": [
      {"id": "engineer", "persona": "Default Prompt Reframer"},
      {"id": "oracle", "persona": "Default Civic Information Specialist"},
      {"id": "analyst", "persona": "Default Public Communication Analyst"},
      {"id": "rewriter", "persona": "Default Final Editor"}
    ],
    "edges": [
      {"source": "engineer", "target": "oracle"},
      {"source": "oracle", "target": "analyst"},
      {"source": "prompt", "target": "rewriter"},
      {"source": "analyst", "target": "rewriter"}
    ]
  },
  "user_prompt": "Why is my property tax so high?"
}
```

This creates an improved workflow where:
1. Engineer reframes the prompt
2. Oracle generates initial response  
3. Analyst critiques the response
4. **Rewriter creates final polished version** with both the original prompt context AND the critique

### Direct Prompt Access
```json
{
  "graph": {
    "nodes": [
      {"id": "oracle", "persona": "Default Civic Information Specialist"}
    ],
    "edges": [
      {"source": "prompt", "target": "oracle"}
    ]
  },
  "user_prompt": "What are the benefits of renewable energy?"
}
```

This gives the oracle direct access to the user's original prompt without any preprocessing.

### Strategic Analysis System - Updated
```json
{
  "graph": {
    "nodes": [
      {"id": "framer", "persona": "Problem Framer"},
      {"id": "advisor", "persona": "Policy and Technology Advisor"},
      {"id": "analyst", "persona": "Public Communication Analyst"},
      {"id": "critic", "persona": "Critical Report Analyst"}
    ],
    "edges": [
      {"source": "prompt", "target": "framer"},
      {"source": "framer", "target": "advisor"},
      {"source": "advisor", "target": "analyst"},
      {"source": "advisor", "target": "critic"},
      {"source": "prompt", "target": "critic"}
    ]
  },
  "user_prompt": "Should our county implement AI-powered surveillance cameras in public spaces?"
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing data, invalid format, no valid personas found, blank nodes detected)
- `404`: Not Found (persona not found)
- `409`: Conflict (persona already exists)
- `500`: Internal Server Error

Common error scenarios:
- **No valid personas found**: Ensure persona names match exactly (case-sensitive)
- **Missing graph data**: Provide both `graph` and `user_prompt` in request body
- **Invalid edges**: Ensure source and target node IDs exist in the graph
- **Blank nodes detected**: All nodes must have personas assigned before execution

## Logging

All crew executions are logged to `crew_run.log` with detailed information about each step.

## Frontend Development

For frontend developers:

1. **Start with the health check** to verify backend connectivity
2. **Load available personas** using GET `/api/personas` for UI components
3. **Implement graph building** - allow users to create nodes and edges
4. **Handle blank nodes** - support creating nodes without personas and validation
5. **Handle async execution** - crew runs can take 30-60 seconds
6. **Display step-by-step results** - show both final output and individual step outputs

## File Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── personas.json       # Persona definitions
├── test_backend.py     # Full API test suite
├── test_blank_nodes.py # Blank nodes validation test
├── simple_test.py      # Basic functionality test
├── api_examples.md     # Curl/PowerShell examples
├── crew_run.log        # Execution logs
└── BACKEND_README.md   # This file
```