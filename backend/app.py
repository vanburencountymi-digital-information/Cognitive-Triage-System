import os
import logging
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables
load_dotenv()

# Setup logging
log_file = "backend/crew_run.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, mode='w'),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
PERSONAS_FILE = "backend/personas.json"

def log_section(title: str):
    logging.info("\n" + "#" * 60)
    logging.info(f"# {title}")
    logging.info("#" * 60 + "\n")

def load_personas():
    """Load personas from JSON file"""
    if not os.path.exists(PERSONAS_FILE):
        return []
    
    with open(PERSONAS_FILE, 'r') as f:
        return json.load(f)

def save_personas(personas):
    """Save personas to JSON file"""
    with open(PERSONAS_FILE, 'w') as f:
        json.dump(personas, f, indent=4)

def find_persona_by_name(name):
    """Find a persona by name"""
    personas = load_personas()
    for persona in personas:
        if persona['name'] == name:
            return persona
    return None

def create_agent_from_persona(persona):
    """Create a CrewAI Agent from a persona definition"""
    agent_data = persona['agent']
    return Agent(
        role=agent_data['role'],
        goal=agent_data['goal'],
        backstory=agent_data['backstory'],
        verbose=True,
        allow_delegation=False
    )

def create_task_from_persona(persona, context_tasks=None, user_prompt=None):
    """Create a CrewAI Task from a persona definition"""
    task_data = persona['task']
    description = task_data['description']
    
    # Replace placeholder if user_prompt is provided
    if user_prompt and '{user_prompt}' in description:
        description = description.format(user_prompt=user_prompt)
    
    return Task(
        description=description,
        agent=create_agent_from_persona(persona),
        context=context_tasks or [],
        expected_output=task_data['expected_output']
    )

def execute_crew_graph(graph_data, user_prompt):
    """
    Execute a crew based on a graph definition
    
    Args:
        graph_data: dict with 'nodes' and 'edges' keys
        user_prompt: string user input
    
    Returns:
        dict with final output and step outputs
    """
    log_section("New Crew Run Started")
    
    nodes = graph_data.get('nodes', [])
    edges = graph_data.get('edges', [])
    
    if not nodes:
        raise ValueError("No nodes provided in graph")
    
    # Create a mapping of node IDs to personas
    node_map = {}
    tasks = {}
    
    # First pass: create all agents and tasks
    for node in nodes:
        node_id = node.get('id')
        persona_name = node.get('persona')
        
        if not node_id or not persona_name:
            continue
            
        persona = find_persona_by_name(persona_name)
        if not persona:
            logging.warning(f"Persona '{persona_name}' not found for node {node_id}")
            continue
        
        # Create task (context will be set in second pass)
        task = create_task_from_persona(persona, user_prompt=user_prompt)
        tasks[node_id] = task
        node_map[node_id] = node
    
    # Validate that we have at least one task
    if not tasks:
        raise ValueError("No valid personas found for any nodes in the graph. Please ensure the persona names match those in personas.json")
    
    # Second pass: set up task dependencies based on edges
    for edge in edges:
        source_id = edge.get('source')
        target_id = edge.get('target')
        
        if source_id in tasks and target_id in tasks:
            # Add source task as context for target task
            if tasks[target_id].context is None:
                tasks[target_id].context = []
            tasks[target_id].context.append(tasks[source_id])
    
    # Find tasks with no dependencies (entry points)
    entry_tasks = []
    for node_id, task in tasks.items():
        if not task.context:
            entry_tasks.append(task)
    
    if not entry_tasks:
        # If no entry points found, use all tasks
        entry_tasks = list(tasks.values())
    
    # Create and run the crew
    all_agents = [task.agent for task in tasks.values()]
    all_tasks = list(tasks.values())
    
    # Additional validation
    if not all_agents:
        raise ValueError("No agents could be created from the provided personas")
    if not all_tasks:
        raise ValueError("No tasks could be created from the provided personas")
    
    crew = Crew(
        agents=all_agents,
        tasks=all_tasks,
        process=Process.sequential,
        verbose=True
    )
    
    final_output = crew.kickoff()
    
    # Extract raw output from CrewOutput object
    if hasattr(final_output, 'raw'):
        final_output_text = final_output.raw
    else:
        final_output_text = str(final_output)
    
    # Collect step outputs
    steps_output = {}
    for node_id, task in tasks.items():
        output = "Task did not produce output."
        if task.output:
            output = task.output.raw
        steps_output[node_id] = {
            "output": output,
            "persona": node_map[node_id].get('persona'),
            "role": node_map[node_id].get('role', '')
        }
    
    log_section("Final Result")
    logging.info(final_output_text)
    
    return {
        "final": final_output_text,
        "steps": steps_output
    }

# API Routes

@app.route('/api/personas', methods=['GET'])
def get_personas():
    """Get all persona definitions"""
    try:
        personas = load_personas()
        return jsonify(personas)
    except Exception as e:
        logging.error(f"Error loading personas: {e}")
        return jsonify({"error": "Failed to load personas"}), 500

@app.route('/api/personas', methods=['POST'])
def create_persona():
    """Create a new persona"""
    try:
        data = request.get_json()
        required_fields = ['name', 'agent', 'task']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        personas = load_personas()
        
        # Check if persona with this name already exists
        for persona in personas:
            if persona['name'] == data['name']:
                return jsonify({"error": "Persona with this name already exists"}), 409
        
        personas.append(data)
        save_personas(personas)
        
        return jsonify({"message": "Persona created successfully", "persona": data}), 201
        
    except Exception as e:
        logging.error(f"Error creating persona: {e}")
        return jsonify({"error": "Failed to create persona"}), 500

@app.route('/api/personas/<name>', methods=['PUT'])
def update_persona(name):
    """Update an existing persona"""
    try:
        data = request.get_json()
        personas = load_personas()
        
        for i, persona in enumerate(personas):
            if persona['name'] == name:
                personas[i] = data
                save_personas(personas)
                return jsonify({"message": "Persona updated successfully", "persona": data})
        
        return jsonify({"error": "Persona not found"}), 404
        
    except Exception as e:
        logging.error(f"Error updating persona: {e}")
        return jsonify({"error": "Failed to update persona"}), 500

@app.route('/api/personas/<name>', methods=['DELETE'])
def delete_persona(name):
    """Delete a persona"""
    try:
        personas = load_personas()
        
        for i, persona in enumerate(personas):
            if persona['name'] == name:
                deleted_persona = personas.pop(i)
                save_personas(personas)
                return jsonify({"message": "Persona deleted successfully", "persona": deleted_persona})
        
        return jsonify({"error": "Persona not found"}), 404
        
    except Exception as e:
        logging.error(f"Error deleting persona: {e}")
        return jsonify({"error": "Failed to delete persona"}), 500

@app.route('/api/run-crew-graph', methods=['POST'])
def run_crew_graph():
    """Execute a crew based on a graph definition"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        graph_data = data.get('graph', {})
        user_prompt = data.get('user_prompt', '')
        
        if not graph_data:
            return jsonify({"error": "No graph data provided"}), 400
        
        result = execute_crew_graph(graph_data, user_prompt)
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logging.error(f"Error executing crew: {e}")
        return jsonify({"error": "Failed to execute crew"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Cognitive Triage System API"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 