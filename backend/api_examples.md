# API Usage Examples

## Health Check
```bash
curl http://localhost:5000/health
```

## Get All Personas
```bash
curl http://localhost:5000/api/personas
```

## Create a New Persona
```bash
curl -X POST http://localhost:5000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Persona",
    "agent": {
      "role": "Test Role",
      "goal": "Test goal for demonstration",
      "backstory": "This is a test persona for API testing"
    },
    "task": {
      "description": "This is a test task description with {user_prompt}",
      "expected_output": "A test output"
    }
  }'
```

## Update a Persona
```bash
curl -X PUT http://localhost:5000/api/personas/Test%20Persona \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Persona",
    "agent": {
      "role": "Updated Test Role",
      "goal": "Updated test goal",
      "backstory": "Updated backstory"
    },
    "task": {
      "description": "Updated task description with {user_prompt}",
      "expected_output": "Updated expected output"
    }
  }'
```

## Delete a Persona
```bash
curl -X DELETE http://localhost:5000/api/personas/Test%20Persona
```

## Run Crew Graph (Original 4-Node System)
```bash
curl -X POST http://localhost:5000/api/run-crew-graph \
  -H "Content-Type: application/json" \
  -d '{
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
    "user_prompt": "Why is my property tax so high? This is ridiculous!"
  }'
```

## Run Crew Graph (Strategic Analysis System)
```bash
curl -X POST http://localhost:5000/api/run-crew-graph \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {
      "nodes": [
        {"id": "framer", "persona": "Problem Framer"},
        {"id": "advisor", "persona": "Policy and Technology Advisor"},
        {"id": "analyst", "persona": "Public Communication Analyst"},
        {"id": "critic", "persona": "Critical Report Analyst"}
      ],
      "edges": [
        {"source": "framer", "target": "advisor"},
        {"source": "advisor", "target": "analyst"},
        {"source": "advisor", "target": "critic"}
      ]
    },
    "user_prompt": "Should our county implement AI-powered surveillance cameras in public spaces?"
  }'
```

## Using PowerShell (Windows)
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get

# Get personas
Invoke-RestMethod -Uri "http://localhost:5000/api/personas" -Method Get

# Run crew graph
$body = @{
    graph = @{
        nodes = @(
            @{id="engineer"; persona="Default Prompt Reframer"}
            @{id="oracle"; persona="Default Civic Information Specialist"}
            @{id="analyst"; persona="Default Public Communication Analyst"}
            @{id="rewriter"; persona="Default Final Editor"}
        )
        edges = @(
            @{source="engineer"; target="oracle"}
            @{source="oracle"; target="analyst"}
            @{source="oracle"; target="rewriter"}
            @{source="analyst"; target="rewriter"}
        )
    }
    user_prompt = "Why is my property tax so high?"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/run-crew-graph" -Method Post -Body $body -ContentType "application/json"
``` 