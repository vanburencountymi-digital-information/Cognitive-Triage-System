#!/usr/bin/env python3
"""
Debug script to test persona loading
"""

import os
import json

print("Current directory:", os.getcwd())
print("Files in current directory:", os.listdir('.'))

# Test loading personas directly
try:
    with open('personas.json', 'r') as f:
        personas = json.load(f)
    print(f"Successfully loaded {len(personas)} personas")
    if personas:
        print("First persona name:", personas[0]['name'])
    else:
        print("No personas found in file")
except Exception as e:
    print(f"Error loading personas: {e}")

# Test the app's load_personas function
try:
    import app
    app_personas = app.load_personas()
    print(f"App loaded {len(app_personas)} personas")
    if app_personas:
        print("First persona name:", app_personas[0]['name'])
    else:
        print("No personas found by app")
    
    # Test find_persona_by_name
    test_persona = app.find_persona_by_name("Default Prompt Reframer")
    if test_persona:
        print(f"Found persona: {test_persona['name']}")
    else:
        print("Could not find 'Default Prompt Reframer'")
        
except Exception as e:
    print(f"Error with app.load_personas(): {e}") 