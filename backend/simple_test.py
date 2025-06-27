#!/usr/bin/env python3
"""
Simple test script for the Cognitive Triage System Flask Backend
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_simple_crew():
    """Test running a crew with just one agent"""
    print("Testing simple crew with one agent...")
    
    # Create a simple 1-node graph
    graph_data = {
        "nodes": [
            {
                "id": "single_agent",
                "persona": "Default Prompt Reframer",
                "role": "Prompt Reframer"
            }
        ],
        "edges": []
    }
    
    payload = {
        "graph": graph_data,
        "user_prompt": "Why is my property tax so high?"
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
        print("Success! Final Output:")
        print(result["final"])
        print("\nStep Outputs:")
        for node_id, step_data in result["steps"].items():
            print(f"\n{node_id} ({step_data['persona']}):")
            print(step_data["output"])
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_health():
    """Test health check"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Health check passed!")
        return True
    else:
        print("Health check failed!")
        return False

if __name__ == "__main__":
    print("=== Simple Backend Test ===\n")
    
    try:
        if test_health():
            test_simple_crew()
        else:
            print("Health check failed, skipping crew test")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Flask server.")
        print("Make sure the server is running with: python app.py")
    except Exception as e:
        print(f"Error during testing: {e}") 