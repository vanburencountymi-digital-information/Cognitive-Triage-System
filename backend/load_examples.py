#!/usr/bin/env python3
"""
Script to load example systems into the backend
"""

import json
import requests
import sys

BASE_URL = "http://localhost:5000"

def load_example_systems():
    """Load example systems from example_systems.json"""
    try:
        # Read example systems
        with open('example_systems.json', 'r') as f:
            example_systems = json.load(f)
        
        print(f"Found {len(example_systems)} example systems to load...")
        
        # Load each system
        for system in example_systems:
            print(f"Loading: {system['name']}")
            
            response = requests.post(
                f"{BASE_URL}/api/systems",
                json=system,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 201:
                print(f"  ✓ Successfully loaded: {system['name']}")
            elif response.status_code == 409:
                print(f"  ⚠ Already exists: {system['name']}")
            else:
                print(f"  ✗ Error loading {system['name']}: {response.text}")
        
        print("\nExample systems loaded successfully!")
        print("You can now use the frontend to load these systems.")
        
    except FileNotFoundError:
        print("Error: example_systems.json not found")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Flask server.")
        print("Make sure the server is running with: python app.py")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=== Loading Example Systems ===\n")
    load_example_systems() 