import os
import logging
import gradio as gr
import json
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables
load_dotenv()

# Setup logging to both console and file
log_file = "crew_run.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, mode='w'),
        logging.StreamHandler()
    ]
)

# --- Configuration for Personas ---
PERSONAS_FILE = "personas.json"
default_agents = {
    "engineer": {
        "name": "Default Prompt Reframer",
        "role": "Prompt Reframer",
        "goal": "Turn emotionally charged or biased citizen prompts into clear, neutral questions that a government assistant could help answer.",
        "backstory": "You're a skilled communication liaison who helps translate frustration into constructive dialogue.",
        "task": {
            "description": "The user wrote: \"{user_prompt}\"\nReframe this into a neutral, clear, good-faith question.",
            "expected_output": "A single sentence or question that invites explanation or help."
        }
    },
    "oracle": {
        "name": "Default Civic Information Specialist",
        "role": "Civic Information Specialist",
        "goal": "Provide clear, calm, and empathetic explanations about local government processes.",
        "backstory": "You work for a local government help desk, explaining policies in a helpful and respectful way.",
        "task": {
            "description": "Using the reframed prompt, provide an empathetic explanation of the issue.",
            "expected_output": "A brief but helpful, plain-language response to the user's question."
        }
    },
    "analyst": {
        "name": "Default Public Communication Analyst",
        "role": "Public Communication Analyst",
        "goal": "Review content for tone, clarity, and empathy.",
        "backstory": "You are a communications specialist for a county government, ensuring messages are human and respectful.",
        "task": {
            "description": "Review the provided response. Your goal is to provide constructive feedback. Do NOT rewrite the content.",
            "expected_output": "A bullet-pointed list of feedback and suggestions for improvement."
        }
    },
    "rewriter": {
        "name": "Default Final Editor",
        "role": "Final Editor",
        "goal": "Take an initial response and a critique, and rewrite the response to incorporate the feedback.",
        "backstory": "You are the final gatekeeper of quality, seamlessly integrating feedback to create a perfect final version.",
        "task": {
            "description": "Rewrite the initial response, addressing all points in the critique.",
            "expected_output": "The final, polished version of the content, rewritten based on the critique."
        }
    }
}

def initialize_personas_file():
    if not os.path.exists(PERSONAS_FILE):
        initial_personas = []
        for key, data in default_agents.items():
            persona = {
                "name": data["name"],
                "agent": {"role": data["role"], "goal": data["goal"], "backstory": data["backstory"]},
                "task": {"description": data["task"]["description"], "expected_output": data["task"]["expected_output"]}
            }
            initial_personas.append(persona)
        with open(PERSONAS_FILE, 'w') as f:
            json.dump(initial_personas, f, indent=4)

def load_personas():
    initialize_personas_file()
    with open(PERSONAS_FILE, 'r') as f:
        return json.load(f)

def save_persona(name, role, goal, backstory, task_desc, task_output):
    personas = load_personas()
    # Check if persona with this name already exists
    for i, p in enumerate(personas):
        if p['name'] == name:
            personas[i] = {
                "name": name,
                "agent": {"role": role, "goal": goal, "backstory": backstory},
                "task": {"description": task_desc, "expected_output": task_output}
            }
            break
    else: # If loop completes without break, persona is new
        personas.append({
            "name": name,
            "agent": {"role": role, "goal": goal, "backstory": backstory},
            "task": {"description": task_desc, "expected_output": task_output}
        })
    
    with open(PERSONAS_FILE, 'w') as f:
        json.dump(personas, f, indent=4)
    
    return [p['name'] for p in personas]

def log_section(title: str):
    logging.info("\n" + "#" * 60)
    logging.info(f"# {title}")
    logging.info("#" * 60 + "\n")

# === CORE FUNCTION TO RUN THE CREW ===
def run_crew(user_prompt,
             engineer_role, engineer_goal, engineer_backstory, engineer_task_desc, engineer_task_expected_out,
             oracle_role, oracle_goal, oracle_backstory, oracle_task_desc, oracle_task_expected_out,
             analyst_role, analyst_goal, analyst_backstory, analyst_task_desc, analyst_task_expected_out,
             rewriter_role, rewriter_goal, rewriter_backstory, rewriter_task_desc, rewriter_task_expected_out):
    
    log_section("New Crew Run Started")

    # Create Agents
    engineer = Agent(role=engineer_role, goal=engineer_goal, backstory=engineer_backstory, verbose=True, allow_delegation=False)
    oracle = Agent(role=oracle_role, goal=oracle_goal, backstory=oracle_backstory, verbose=True, allow_delegation=False)
    analyst = Agent(role=analyst_role, goal=analyst_goal, backstory=analyst_backstory, verbose=True, allow_delegation=False)
    rewriter = Agent(role=rewriter_role, goal=rewriter_goal, backstory=rewriter_backstory, verbose=True, allow_delegation=False)

    # Create Tasks
    engineering_task = Task(
        description=engineer_task_desc.format(user_prompt=user_prompt),
        agent=engineer,
        expected_output=engineer_task_expected_out
    )
    generation_task = Task(
        description=oracle_task_desc,
        agent=oracle,
        context=[engineering_task],
        expected_output=oracle_task_expected_out
    )
    analysis_task = Task(
        description=analyst_task_desc,
        agent=analyst,
        context=[generation_task],
        expected_output=analyst_task_expected_out
    )
    rewriting_task = Task(
        description=rewriter_task_desc,
        agent=rewriter,
        context=[generation_task, analysis_task],
        expected_output=rewriter_task_expected_out
    )

    # Assemble and run the crew
    crew = Crew(
        agents=[engineer, oracle, analyst, rewriter],
        tasks=[engineering_task, generation_task, analysis_task, rewriting_task],
        process=Process.sequential,
        verbose=True
    )

    final_output = crew.kickoff()
    log_section("Final Result")
    logging.info(final_output)

    # Capture intermediate outputs
    engineered_prompt = "Task did not produce output."
    if engineering_task.output:
        engineered_prompt = engineering_task.output.raw

    generated_content = "Task did not produce output."
    if generation_task.output:
        generated_content = generation_task.output.raw

    critique_output = "Task did not produce output."
    if analysis_task.output:
        critique_output = analysis_task.output.raw

    return final_output, engineered_prompt, generated_content, critique_output

# === GRADIO UI SETUP ===
with gr.Blocks(theme=gr.themes.Soft()) as interface:
    gr.Markdown("# 🧠 Cognitive Triage System")
    gr.Markdown("Type a prompt, and watch as 4 AI agents refine, generate, critique, and rewrite your result. You can customize the agents and tasks below.")

    def get_persona_names():
        return [p['name'] for p in load_personas()]

    def update_fields_from_persona(persona_name):
        if not persona_name:
            return "", "", "", "", "", ""
        
        all_personas = load_personas() # Reload fresh
        for p in all_personas:
            if p['name'] == persona_name:
                return (
                    p['name'],
                    p['agent']['role'],
                    p['agent']['goal'],
                    p['agent']['backstory'],
                    p['task']['description'],
                    p['task']['expected_output']
                )
        return "", "", "", "", "", ""

    def handle_save_persona(name, role, goal, backstory, task_desc, task_output):
        if not name or not name.strip():
            raise gr.Error("Persona Name cannot be empty.")
        
        save_persona(name, role, goal, backstory, task_desc, task_output)
        new_persona_names = get_persona_names()
        
        gr.Info(f"Persona '{name}' saved!")
        
        # Create an update object for each dropdown
        updates = [gr.update(choices=new_persona_names, value=name) for _ in range(4)]
        return tuple(updates)

    with gr.Row():
        user_prompt = gr.Textbox(lines=4, placeholder="Enter your prompt here...", label="User Prompt", scale=3)
        submit_button = gr.Button("Run Crew", variant="primary", scale=1)

    with gr.Row():
        outputs = [
            gr.Textbox(label="Final Polished Content"),
            gr.Textbox(label="Step 1: Reframed Prompt"),
            gr.Textbox(label="Step 2: Initial Response"),
            gr.Textbox(label="Step 3: Critique")
        ]

    with gr.Accordion("Customize Crew", open=False):
        gr.Markdown("## Agent & Task Definitions")
        
        agent_configs = {}
        persona_selectors = []
        agent_keys = ["engineer", "oracle", "analyst", "rewriter"]

        # First, create all the UI components and store references
        for key in agent_keys:
            with gr.Tab(default_agents[key]["role"]):
                with gr.Column():
                    default_persona_name = default_agents[key]["name"]
                    persona_selector = gr.Dropdown(
                        label="Select Persona", 
                        choices=get_persona_names(), 
                        value=default_persona_name
                    )
                    persona_selectors.append(persona_selector)
                    
                    with gr.Accordion("Edit/Create Persona", open=False):
                        persona_name = gr.Textbox(label="Persona Name", value=default_persona_name)
                        role = gr.Textbox(label="Role", value=default_agents[key]["role"], lines=2)
                        goal = gr.Textbox(label="Goal", value=default_agents[key]["goal"], lines=4)
                        backstory = gr.Textbox(label="Backstory", value=default_agents[key]["backstory"], lines=4)
                        task_desc = gr.Textbox(label="Task Description", value=default_agents[key]["task"]["description"], lines=4)
                        task_expected_out = gr.Textbox(label="Task Expected Output", value=default_agents[key]["task"]["expected_output"], lines=2)
                        save_button = gr.Button("Save Persona")
                        
                        agent_configs[key] = {
                            "persona_selector": persona_selector,
                            "persona_name": persona_name,
                            "role": role, "goal": goal, "backstory": backstory,
                            "task_desc": task_desc, "task_expected_out": task_expected_out,
                            "save_button": save_button
                        }

        # Second, wire up all the event handlers
        for key in agent_keys:
            config = agent_configs[key]
            
            config["persona_selector"].change(
                fn=update_fields_from_persona,
                inputs=config["persona_selector"],
                outputs=[
                    config["persona_name"], config["role"], config["goal"],
                    config["backstory"], config["task_desc"], config["task_expected_out"]
                ]
            )
            
            config["save_button"].click(
                fn=handle_save_persona,
                inputs=[
                    config["persona_name"], config["role"], config["goal"],
                    config["backstory"], config["task_desc"], config["task_expected_out"]
                ],
                outputs=persona_selectors
            )

    run_crew_inputs = [user_prompt]
    for key in agent_keys:
        config = agent_configs[key]
        run_crew_inputs.extend([
            config["role"], config["goal"], config["backstory"],
            config["task_desc"], config["task_expected_out"]
        ])
              
    submit_button.click(fn=run_crew, inputs=run_crew_inputs, outputs=outputs)

if __name__ == "__main__":
    interface.launch()
