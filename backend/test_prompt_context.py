#!/usr/bin/env python3
"""
Test script for the new prompt context functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_prompt_context_system():
    """Test the new system with prompt context"""
    print("Testing prompt context system...")
    
    # Create a graph where the final editor gets both the prompt and the analyst's critique
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
            {"source": "prompt", "target": "rewriter"},  # Final editor gets original prompt
            {"source": "analyst", "target": "rewriter"}   # Final editor gets critique
        ]
    }
    
    payload = {
        "graph": graph_data,
        "user_prompt": "Why is my property tax so high? This is ridiculous!"
    }
    
    print("Sending request with prompt context...")
    response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("Success! Final Output:")
        print(result["final"])
        print("\nStep Outputs:")
        for node_id, step_data in result["steps"].items():
            print(f"\n{node_id} ({step_data['persona']}):")
            if node_id == 'prompt':
                print(f"Prompt: {step_data['output']}")
            else:
                print(step_data["output"][:200] + "..." if len(step_data["output"]) > 200 else step_data["output"])
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_simple_prompt_context():
    """Test a simple case where one agent gets the prompt directly"""
    print("\nTesting simple prompt context...")
    
    graph_data = {
        "nodes": [
            {
                "id": "oracle",
                "persona": "Default Civic Information Specialist",
                "role": "Civic Information Specialist"
            }
        ],
        "edges": [
            {"source": "prompt", "target": "oracle"}  # Oracle gets the prompt directly
        ]
    }
    
    payload = {
        "graph": graph_data,
        "user_prompt": "What are the benefits of renewable energy?"
    }
    
    print("Sending simple request...")
    response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("Success! Final Output:")
        print(result["final"])
        print("\nStep Outputs:")
        for node_id, step_data in result["steps"].items():
            print(f"\n{node_id} ({step_data['persona']}):")
            if node_id == 'prompt':
                print(f"Prompt: {step_data['output']}")
            else:
                print(step_data["output"])
        return True
    else:
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    print("=== Prompt Context Test ===\n")
    
    try:
        test_simple_prompt_context()
        test_prompt_context_system()
        
        print("\nAll tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Flask server.")
        print("Make sure the server is running with: python app.py")
    except Exception as e:
        print(f"Error during testing: {e}") 