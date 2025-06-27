# Cognitive Triage System - Flask Backend

This Flask backend provides a REST API for the Cognitive Triage System, separating the CrewAI logic from the frontend interface.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Personas Management

#### Get All Personas
- **GET** `/api/personas`
- Returns: Array of persona definitions

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
  "user_prompt": "User input text"
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

## Graph Structure

The graph defines how agents work together:

- **Nodes**: Each node represents an agent/task with a specific persona
- **Edges**: Define dependencies between tasks (source → target)
- **Execution**: Tasks are executed sequentially based on dependencies

## Testing

Run the test script to verify the API:
```bash
python test_backend.py
```

## Example Usage

### Simple 4-Node Graph (Original System)
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
      {"source": "oracle", "target": "rewriter"},
      {"source": "analyst", "target": "rewriter"}
    ]
  },
  "user_prompt": "Why is my property tax so high?"
}
```

This creates the same workflow as the original Gradio interface:
1. Engineer reframes the prompt
2. Oracle generates initial response
3. Analyst critiques the response
4. Rewriter creates final polished version

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing data, invalid format)
- `404`: Not Found (persona not found)
- `409`: Conflict (persona already exists)
- `500`: Internal Server Error

## Logging

All crew executions are logged to `crew_run.log` with detailed information about each step. 