#!/usr/bin/env python3
"""
Test script for the Cognitive Triage System Flask Backend
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_get_personas():
    """Test getting all personas"""
    print("Testing get personas...")
    response = requests.get(f"{BASE_URL}/api/personas")
    print(f"Status: {response.status_code}")
    personas = response.json()
    print(f"Found {len(personas)} personas:")
    for persona in personas:
        print(f"  - {persona['name']}")
    print()

def test_run_crew_graph():
    """Test running a crew with a simple graph"""
    print("Testing run crew graph...")
    
    # Create a simple 4-node graph similar to the original system
    graph_data = {
        "nodes": [
            {
                "id": "engineer",
                "persona": "Default Prompt Reframer",
                "role": "Prompt Reframer"
            },
            {
                "id": "oracle", 
                "persona": "Default Civic Information Specialist",
                "role": "Civic Information Specialist"
            },
            {
                "id": "analyst",
                "persona": "Default Public Communication Analyst", 
                "role": "Public Communication Analyst"
            },
            {
                "id": "rewriter",
                "persona": "Default Final Editor",
                "role": "Final Editor"
            }
        ],
        "edges": [
            {"source": "engineer", "target": "oracle"},
            {"source": "oracle", "target": "analyst"},
            {"source": "oracle", "target": "rewriter"},
            {"source": "analyst", "target": "rewriter"}
        ]
    }
    
    payload = {
        "graph": graph_data,
        "user_prompt": "Why is my property tax so high? This is ridiculous!"
    }
    
    print("Sending request...")
    response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("Final Output:")
        print(result["final"])
        print("\nStep Outputs:")
        for node_id, step_data in result["steps"].items():
            print(f"\n{node_id} ({step_data['persona']}):")
            print(step_data["output"][:200] + "..." if len(step_data["output"]) > 200 else step_data["output"])
    else:
        print(f"Error: {response.text}")
    
    print()

def test_create_persona():
    """Test creating a new persona"""
    print("Testing create persona...")
    
    new_persona = {
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
    }
    
    response = requests.post(
        f"{BASE_URL}/api/personas",
        json=new_persona,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    print("=== Cognitive Triage System Backend Test ===\n")
    
    try:
        test_health_check()
        test_get_personas()
        test_create_persona()
        test_run_crew_graph()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Flask server.")
        print("Make sure the server is running with: python app.py")
    except Exception as e:
        print(f"Error during testing: {e}") 