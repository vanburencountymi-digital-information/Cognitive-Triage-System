import os
import logging
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
import datetime

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
PERSONAS_FILE = "personas.json"
SYSTEMS_FILE = "systems.json"

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

def load_systems():
    """Load saved systems from JSON file"""
    if not os.path.exists(SYSTEMS_FILE):
        return []
    
    with open(SYSTEMS_FILE, 'r') as f:
        return json.load(f)

def save_systems(systems):
    """Save systems to JSON file"""
    with open(SYSTEMS_FILE, 'w') as f:
        json.dump(systems, f, indent=4)

def find_system_by_name(name):
    """Find a system by name"""
    systems = load_systems()
    for system in systems:
        if system['name'] == name:
            return system
    return None

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

def create_prompt_task(user_prompt):
    """Create a special task that represents the user's prompt"""
    from crewai import Agent, Task
    
    # Create a simple agent for the prompt task
    prompt_agent = Agent(
        role="Prompt Provider",
        goal="Provide the user's original prompt as context",
        backstory="You are a simple agent that provides the user's original input.",
        verbose=True,
        allow_delegation=False
    )
    
    # Create a task that just returns the user prompt
    prompt_task = Task(
        description="Return the user's original prompt exactly as provided.",
        agent=prompt_agent,
        expected_output="The user's original prompt text."
    )
    
    # Set the output directly since this task doesn't need to run
    prompt_task.output = type('obj', (object,), {'raw': user_prompt})()
    
    return prompt_task

def create_task_from_persona(persona, context_tasks=None, user_prompt=None, prompt_context=None):
    """Create a CrewAI Task from a persona definition"""
    task_data = persona['task']
    description = task_data['description']
    
    # Replace placeholder if user_prompt is provided
    if user_prompt and '{user_prompt}' in description:
        description = description.format(user_prompt=user_prompt)
    
    # If we have prompt context, modify the description to include it
    if prompt_context:
        description = f"Original user prompt: {prompt_context}\n\n{description}"
    
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
    try:
        log_section("New Crew Run Started")
        logging.info(f"User Prompt: {user_prompt}")
        
        nodes = graph_data.get('nodes', [])
        edges = graph_data.get('edges', [])
        
        logging.info(f"Graph Nodes: {[node.get('id') for node in nodes]}")
        logging.info(f"Graph Edges: {[(edge.get('source'), edge.get('target')) for edge in edges]}")
        
        if not nodes:
            raise ValueError("No nodes provided in graph")
        
        # Create a mapping of node IDs to personas
        node_map = {}
        tasks = {}
        
        # Create the special Prompt task
        prompt_task = create_prompt_task(user_prompt)
        tasks['prompt'] = prompt_task
        node_map['prompt'] = {'id': 'prompt', 'persona': 'Prompt', 'role': 'Prompt Provider'}
        logging.info("Created special 'prompt' node")
        
        # First pass: create all agents and tasks
        blank_nodes = []
        for node in nodes:
            node_id = node.get('id')
            persona_name = node.get('persona')
            
            if not node_id:
                logging.warning(f"Skipping node with missing id: {node}")
                continue
            
            # Skip the special "prompt" node as it's created programmatically
            if node_id == 'prompt':
                logging.info(f"Skipping special 'prompt' node from graph data - using programmatically created one")
                continue
                
            if not persona_name or persona_name.strip() == '':
                blank_nodes.append(node_id)
                logging.warning(f"Node '{node_id}' has no persona assigned")
                continue
                
            persona = find_persona_by_name(persona_name)
            if not persona:
                logging.warning(f"Persona '{persona_name}' not found for node {node_id}")
                continue
            
            try:
                # Create task (context will be set in second pass)
                task = create_task_from_persona(persona, user_prompt=user_prompt)
                tasks[node_id] = task
                node_map[node_id] = node
                logging.info(f"Created task for node '{node_id}' with persona '{persona_name}'")
            except Exception as e:
                logging.error(f"Failed to create task for node '{node_id}' with persona '{persona_name}': {str(e)}")
                continue
        
        # Check for blank nodes and provide clear error message
        if blank_nodes:
            blank_nodes_str = ', '.join(blank_nodes)
            raise ValueError(f"Cannot run workflow: {len(blank_nodes)} node(s) without personas assigned ({blank_nodes_str}). Please assign personas to all nodes before running.")
        
        # Validate that we have at least one task (excluding prompt)
        if len(tasks) <= 1:  # Only prompt task exists
            raise ValueError("No valid personas found for any nodes in the graph. Please ensure the persona names match those in personas.json")
        
        # Second pass: set up task dependencies based on edges
        logging.info("Setting up task dependencies...")
        for edge in edges:
            source_id = edge.get('source')
            target_id = edge.get('target')
            
            if source_id in tasks and target_id in tasks:
                # Add source task as context for target task
                if tasks[target_id].context is None:
                    tasks[target_id].context = []
                tasks[target_id].context.append(tasks[source_id])
                logging.info(f"Added edge: {source_id} -> {target_id}")
            else:
                logging.warning(f"Invalid edge: {source_id} -> {target_id} (one or both nodes not found)")
        
        # Third pass: handle prompt context for tasks that need it
        # Find tasks that have edges from 'prompt' and add prompt context
        logging.info("Processing prompt context...")
        for edge in edges:
            source_id = edge.get('source')
            target_id = edge.get('target')
            
            if source_id == 'prompt' and target_id in tasks:
                logging.info(f"Adding prompt context to node '{target_id}'")
                # This task needs the original prompt context
                # Recreate the task with prompt context
                persona_name = node_map[target_id].get('persona')
                persona = find_persona_by_name(persona_name)
                if persona:
                    # Get existing context (excluding prompt task)
                    existing_context = []
                    if tasks[target_id].context:
                        existing_context = [ctx for ctx in tasks[target_id].context if ctx != prompt_task]
                    
                    logging.info(f"Node '{target_id}' will receive:")
                    logging.info(f"  - Original prompt context")
                    if existing_context:
                        logging.info(f"  - Context from: {[ctx.agent.role for ctx in existing_context]}")
                    else:
                        logging.info(f"  - No additional context from other agents")
                    
                    # Recreate task with prompt context
                    new_task = create_task_from_persona(
                        persona, 
                        context_tasks=existing_context,
                        user_prompt=user_prompt,
                        prompt_context=user_prompt
                    )
                    tasks[target_id] = new_task
                    logging.info(f"Recreated task for '{target_id}' with prompt context")
        
        # Log final context for each task
        logging.info("Final task context summary:")
        for node_id, task in tasks.items():
            if node_id == 'prompt':
                logging.info(f"  {node_id}: Special prompt node (no execution needed)")
            else:
                context_sources = []
                if task.context:
                    for ctx in task.context:
                        if ctx == prompt_task:
                            context_sources.append("original prompt")
                        else:
                            context_sources.append(f"output from {ctx.agent.role}")
                
                if context_sources:
                    logging.info(f"  {node_id} ({task.agent.role}): Will receive context from {', '.join(context_sources)}")
                else:
                    logging.info(f"  {node_id} ({task.agent.role}): No context (entry point)")
        
        # Find tasks with no dependencies (entry points) - exclude prompt task
        entry_tasks = []
        for node_id, task in tasks.items():
            if node_id != 'prompt' and (not task.context or all(ctx == prompt_task for ctx in task.context)):
                entry_tasks.append(task)
        
        if not entry_tasks:
            # If no entry points found, use all tasks except prompt
            entry_tasks = [task for node_id, task in tasks.items() if node_id != 'prompt']
        
        logging.info(f"Entry points: {[task.agent.role for task in entry_tasks]}")
        
        # Create and run the crew (exclude prompt task from execution)
        all_agents = [task.agent for node_id, task in tasks.items() if node_id != 'prompt']
        all_tasks = [task for node_id, task in tasks.items() if node_id != 'prompt']
        
        # Additional validation
        if not all_agents:
            raise ValueError("No agents could be created from the provided personas")
        if not all_tasks:
            raise ValueError("No tasks could be created from the provided personas")
        
        logging.info("Starting crew execution...")
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
        
        # Collect step outputs and log what each task received
        steps_output = {}
        logging.info("Task execution results:")
        for node_id, task in tasks.items():
            output = "Task did not produce output."
            if task.output:
                output = task.output.raw
            
            steps_output[node_id] = {
                "output": output,
                "persona": node_map[node_id].get('persona'),
                "role": node_map[node_id].get('role', '')
            }
            
            if node_id == 'prompt':
                logging.info(f"  {node_id}: {output}")
            else:
                # Log what context this task received
                context_info = []
                if task.context:
                    for ctx in task.context:
                        if ctx == prompt_task:
                            context_info.append("original prompt")
                        else:
                            context_info.append(f"output from {ctx.agent.role}")
                
                context_str = f" (received: {', '.join(context_info)})" if context_info else " (no context)"
                logging.info(f"  {node_id} ({task.agent.role}):{context_str}")
                logging.info(f"    Output: {output[:100]}{'...' if len(output) > 100 else ''}")
        
        log_section("Final Result")
        logging.info(final_output_text)
        
        return {
            "final": final_output_text,
            "steps": steps_output
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logging.error(f"Error in execute_crew_graph: {str(e)}")
        logging.error(f"Full traceback: {error_details}")
        raise

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
        user_api_key = data.get('user_api_key', '')
        
        logging.info(f"Received request - Graph nodes: {len(graph_data.get('nodes', []))}, Prompt length: {len(user_prompt)}, API key provided: {bool(user_api_key)}")
        
        if not graph_data:
            return jsonify({"error": "No graph data provided"}), 400
        
        if not user_api_key:
            return jsonify({"error": "API key is required. Please set your API key in Settings."}), 400
        
        # Set the user's API key for this request - CrewAI uses litellm which needs both
        import openai
        import os
        
        # Set both the openai client key and environment variable
        openai.api_key = user_api_key
        os.environ['OPENAI_API_KEY'] = user_api_key
        
        logging.info("API key configured for both OpenAI client and environment")
        logging.info("Starting crew execution...")
        result = execute_crew_graph(graph_data, user_prompt)
        logging.info("Crew execution completed successfully")
        return jsonify(result)
        
    except ValueError as e:
        logging.error(f"Validation error: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except ImportError as e:
        logging.error(f"Import error: {str(e)}")
        return jsonify({"error": f"Missing dependency: {str(e)}"}), 500
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logging.error(f"Error executing crew: {str(e)}")
        logging.error(f"Full traceback: {error_details}")
        return jsonify({
            "error": "Failed to execute crew",
            "details": str(e),
            "type": type(e).__name__
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Cognitive Triage System API"})

@app.route('/api/special-nodes', methods=['GET'])
def get_special_nodes():
    """Get information about special nodes that are always available"""
    special_nodes = [
        {
            "id": "prompt",
            "name": "User Prompt",
            "description": "The original user input that can be passed to any agent",
            "type": "prompt",
            "role": "Input Source"
        }
    ]
    return jsonify(special_nodes)

# System Management Endpoints

@app.route('/api/systems', methods=['GET'])
def get_systems():
    """Get all saved system configurations"""
    try:
        systems = load_systems()
        return jsonify(systems)
    except Exception as e:
        logging.error(f"Error loading systems: {e}")
        return jsonify({"error": "Failed to load systems"}), 500

@app.route('/api/systems', methods=['POST'])
def save_system():
    """Save a new system configuration"""
    try:
        data = request.get_json()
        required_fields = ['name', 'graph']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        systems = load_systems()
        
        # Check if system with this name already exists
        for system in systems:
            if system['name'] == data['name']:
                return jsonify({"error": "System with this name already exists"}), 409
        
        # Add metadata
        system_data = {
            "name": data['name'],
            "description": data.get('description', ''),
            "graph": data['graph'],
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        
        systems.append(system_data)
        save_systems(systems)
        
        return jsonify({"message": "System saved successfully", "system": system_data}), 201
        
    except Exception as e:
        logging.error(f"Error saving system: {e}")
        return jsonify({"error": "Failed to save system"}), 500

@app.route('/api/systems/<name>', methods=['GET'])
def get_system(name):
    """Get a specific system by name"""
    try:
        system = find_system_by_name(name)
        if system:
            return jsonify(system)
        else:
            return jsonify({"error": "System not found"}), 404
    except Exception as e:
        logging.error(f"Error loading system: {e}")
        return jsonify({"error": "Failed to load system"}), 500

@app.route('/api/systems/<name>', methods=['PUT'])
def update_system(name):
    """Update an existing system"""
    try:
        data = request.get_json()
        systems = load_systems()
        
        for i, system in enumerate(systems):
            if system['name'] == name:
                # Update the system
                systems[i].update({
                    "name": data.get('name', name),
                    "description": data.get('description', system.get('description', '')),
                    "graph": data.get('graph', system['graph']),
                    "updated_at": datetime.datetime.now().isoformat()
                })
                save_systems(systems)
                return jsonify({"message": "System updated successfully", "system": systems[i]})
        
        return jsonify({"error": "System not found"}), 404
        
    except Exception as e:
        logging.error(f"Error updating system: {e}")
        return jsonify({"error": "Failed to update system"}), 500

@app.route('/api/systems/<name>', methods=['DELETE'])
def delete_system(name):
    """Delete a system"""
    try:
        systems = load_systems()
        
        for i, system in enumerate(systems):
            if system['name'] == name:
                deleted_system = systems.pop(i)
                save_systems(systems)
                return jsonify({"message": "System deleted successfully", "system": deleted_system})
        
        return jsonify({"error": "System not found"}), 404
        
    except Exception as e:
        logging.error(f"Error deleting system: {e}")
        return jsonify({"error": "Failed to delete system"}), 500

@app.route('/api/validate-api-key', methods=['POST'])
def validate_api_key():
    """Validate a user-provided API key"""
    try:
        data = request.get_json()
        api_key = data.get('apiKey', '').strip()
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        # Basic format validation
        if not api_key.startswith('sk-'):
            return jsonify({"error": "Invalid API key format. Should start with 'sk-'"}), 400
        
        # Test the API key with a simple OpenAI call
        try:
            import openai
            openai.api_key = api_key
            
            # Make a simple test call to validate the key
            response = openai.models.list()
            
            # If we get here, the key is valid
            return jsonify({
                "message": "API key is valid",
                "valid": True
            })
            
        except Exception as e:
            # Log only the error type, not the full error which might contain the key
            error_type = type(e).__name__
            logging.error(f"API key validation failed with error type: {error_type}")
            return jsonify({"error": "Invalid API key. Please check your key and try again."}), 400
            
    except Exception as e:
        # Log only the error type, not the full error
        error_type = type(e).__name__
        logging.error(f"Error validating API key (type: {error_type})")
        return jsonify({"error": "Error validating API key"}), 500

@app.route('/api/debug/test-crew', methods=['POST'])
def test_crew():
    """Test endpoint to verify CrewAI is working"""
    try:
        data = request.get_json()
        user_api_key = data.get('user_api_key', '') if data else ''
        
        if not user_api_key:
            return jsonify({"error": "API key is required"}), 400
        
        # Set the user's API key - CrewAI uses litellm which needs both
        import openai
        import os
        
        # Set both the openai client key and environment variable
        openai.api_key = user_api_key
        os.environ['OPENAI_API_KEY'] = user_api_key
        
        logging.info("API key configured for debug test")
        
        # Test basic CrewAI functionality
        from crewai import Agent, Task, Crew, Process
        
        # Create a simple test agent
        test_agent = Agent(
            role="Test Agent",
            goal="Test that CrewAI is working",
            backstory="A simple test agent to verify functionality",
            verbose=True,
            allow_delegation=False
        )
        
        # Create a simple test task
        test_task = Task(
            description="Say 'Hello, CrewAI is working!'",
            agent=test_agent,
            expected_output="A simple greeting message"
        )
        
        # Create and run a simple crew
        crew = Crew(
            agents=[test_agent],
            tasks=[test_task],
            process=Process.sequential,
            verbose=True
        )
        
        result = crew.kickoff()
        
        return jsonify({
            "success": True,
            "message": "CrewAI test completed successfully",
            "output": str(result)
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logging.error(f"Test crew error: {str(e)}")
        logging.error(f"Full traceback: {error_details}")
        return jsonify({
            "success": False,
            "error": str(e),
            "type": type(e).__name__,
            "details": error_details
        }), 500

if __name__ == '__main__':
    # In single-container setup, always use port 5000 for internal communication
    # The PORT environment variable is used by nginx for external access
    port = 5000
    app.run(debug=True, host='0.0.0.0', port=port) 