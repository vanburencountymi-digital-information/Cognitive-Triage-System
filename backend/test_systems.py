#!/usr/bin/env python3
"""
Test script for system save/load functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_save_system():
    """Test saving a system"""
    print("Testing save system...")
    
    # Create a sample system
    system_data = {
        "name": "Test Property Tax System",
        "description": "A system for handling property tax inquiries with prompt context",
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
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/systems",
        json=system_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        result = response.json()
        print(f"System saved: {result['system']['name']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_get_systems():
    """Test getting all systems"""
    print("\nTesting get systems...")
    
    response = requests.get(f"{BASE_URL}/api/systems")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        systems = response.json()
        print(f"Found {len(systems)} systems:")
        for system in systems:
            print(f"  - {system['name']}: {system['description']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_get_system():
    """Test getting a specific system"""
    print("\nTesting get specific system...")
    
    response = requests.get(f"{BASE_URL}/api/systems/Test%20Property%20Tax%20System")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        system = response.json()
        print(f"Retrieved system: {system['name']}")
        print(f"Description: {system['description']}")
        print(f"Nodes: {len(system['graph']['nodes'])}")
        print(f"Edges: {len(system['graph']['edges'])}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_update_system():
    """Test updating a system"""
    print("\nTesting update system...")
    
    update_data = {
        "description": "Updated description for the property tax system",
        "graph": {
            "nodes": [
                {"id": "oracle", "persona": "Default Civic Information Specialist"},
                {"id": "rewriter", "persona": "Default Final Editor"}
            ],
            "edges": [
                {"source": "prompt", "target": "oracle"},
                {"source": "oracle", "target": "rewriter"}
            ]
        }
    }
    
    response = requests.put(
        f"{BASE_URL}/api/systems/Test%20Property%20Tax%20System",
        json=update_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"System updated: {result['system']['description']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_delete_system():
    """Test deleting a system"""
    print("\nTesting delete system...")
    
    response = requests.delete(f"{BASE_URL}/api/systems/Test%20Property%20Tax%20System")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"System deleted: {result['system']['name']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_run_saved_system():
    """Test running a saved system"""
    print("\nTesting run saved system...")
    
    # First save a system
    system_data = {
        "name": "Simple Test System",
        "description": "A simple test system",
        "graph": {
            "nodes": [
                {"id": "oracle", "persona": "Default Civic Information Specialist"}
            ],
            "edges": [
                {"source": "prompt", "target": "oracle"}
            ]
        }
    }
    
    # Save the system
    save_response = requests.post(
        f"{BASE_URL}/api/systems",
        json=system_data,
        headers={"Content-Type": "application/json"}
    )
    
    if save_response.status_code != 201:
        print("Failed to save system for testing")
        return False
    
    # Get the saved system
    get_response = requests.get(f"{BASE_URL}/api/systems/Simple%20Test%20System")
    
    if get_response.status_code != 200:
        print("Failed to retrieve saved system")
        return False
    
    saved_system = get_response.json()
    
    # Run the system
    run_payload = {
        "graph": saved_system['graph'],
        "user_prompt": "What is the capital of France?"
    }
    
    run_response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=run_payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Run status: {run_response.status_code}")
    if run_response.status_code == 200:
        result = run_response.json()
        print("Successfully ran saved system!")
        print(f"Output length: {len(result['final'])}")
        return True
    else:
        print(f"Error running system: {run_response.text}")
        return False

if __name__ == "__main__":
    print("=== System Save/Load Test ===\n")
    
    try:
        test_save_system()
        test_get_systems()
        test_get_system()
        test_update_system()
        test_run_saved_system()
        test_delete_system()
        
        print("\nAll tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Flask server.")
        print("Make sure the server is running with: python app.py")
    except Exception as e:
        print(f"Error during testing: {e}") 