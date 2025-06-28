#!/usr/bin/env python3
"""
Initialize data files for the Cognitive Triage System
This script ensures that personas.json and systems.json exist with default data
"""

import json
import os
import shutil

def init_data_files():
    """Initialize data files if they don't exist"""
    
    # Define file paths (relative to /app in container)
    personas_file = "backend/personas.json"
    systems_file = "backend/systems.json"
    example_systems_file = "backend/example_systems.json"
    
    print(f"Current working directory: {os.getcwd()}")
    print(f"Checking for personas file: {personas_file}")
    print(f"Checking for systems file: {systems_file}")
    
    # Create backend directory if it doesn't exist
    os.makedirs("backend", exist_ok=True)
    
    # Initialize personas.json if it doesn't exist
    if not os.path.exists(personas_file):
        print("Initializing personas.json...")
        # Check if there's an existing personas.json in the source
        source_personas = "personas.json"
        if os.path.exists(source_personas):
            print(f"Copying existing personas from {source_personas}")
            shutil.copy(source_personas, personas_file)
        else:
            print("Creating default personas...")
            default_personas = [
                {
                    "name": "Default Prompt Reframer",
                    "agent": {
                        "role": "Prompt Reframer",
                        "goal": "Turn emotionally charged or biased citizen prompts into clear, neutral questions that a government assistant could help answer.",
                        "backstory": "You're a skilled communication liaison who helps translate frustration into constructive dialogue."
                    },
                    "task": {
                        "description": "The user wrote: \"{user_prompt}\"\nReframe this into a neutral, clear, good-faith question.",
                        "expected_output": "A single sentence or question that invites explanation or help."
                    }
                },
                {
                    "name": "Default Civic Information Specialist",
                    "agent": {
                        "role": "Civic Information Specialist",
                        "goal": "Provide clear, calm, and empathetic explanations about local government processes.",
                        "backstory": "You work for a local government help desk, explaining policies in a helpful and respectful way."
                    },
                    "task": {
                        "description": "Using the reframed prompt, provide an empathetic explanation of the issue.",
                        "expected_output": "A brief but helpful, plain-language response to the user's question."
                    }
                }
            ]
            
            with open(personas_file, 'w') as f:
                json.dump(default_personas, f, indent=2)
        print("✅ personas.json initialized")
    else:
        print("✅ personas.json already exists")
    
    # Initialize systems.json if it doesn't exist
    if not os.path.exists(systems_file):
        print("Initializing systems.json...")
        if os.path.exists(example_systems_file):
            # Copy example systems
            print(f"Copying example systems from {example_systems_file}")
            shutil.copy(example_systems_file, systems_file)
            print("✅ systems.json initialized from examples")
        else:
            # Create empty systems file
            print("Creating empty systems file...")
            with open(systems_file, 'w') as f:
                json.dump([], f)
            print("✅ systems.json initialized (empty)")
    else:
        print("✅ systems.json already exists")
    
    # Verify files exist and have content
    if os.path.exists(personas_file):
        with open(personas_file, 'r') as f:
            personas = json.load(f)
        print(f"✅ personas.json contains {len(personas)} personas")
    
    if os.path.exists(systems_file):
        with open(systems_file, 'r') as f:
            systems = json.load(f)
        print(f"✅ systems.json contains {len(systems)} systems")
    
    print("Data initialization complete!")

if __name__ == "__main__":
    init_data_files() 