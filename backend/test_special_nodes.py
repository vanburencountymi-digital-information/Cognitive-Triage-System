#!/usr/bin/env python3
"""
Test script for the special nodes endpoint
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_special_nodes():
    """Test the special nodes endpoint"""
    print("Testing special nodes endpoint...")
    
    response = requests.get(f"{BASE_URL}/api/special-nodes")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        special_nodes = response.json()
        print("Special nodes found:")
        for node in special_nodes:
            print(f"  - {node['name']} (ID: {node['id']})")
            print(f"    Description: {node['description']}")
            print(f"    Type: {node['type']}")
            print(f"    Role: {node['role']}")
            print()
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_prompt_node_in_graph():
    """Test that the prompt node works in a graph"""
    print("Testing prompt node in graph...")
    
    graph_data = {
        "nodes": [
            {
                "id": "oracle",
                "persona": "Default Civic Information Specialist"
            }
        ],
        "edges": [
            {"source": "prompt", "target": "oracle"}
        ]
    }
    
    payload = {
        "graph": graph_data,
        "user_prompt": "What is the capital of France?"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("Success! The prompt node is working in graphs.")
        print("Final output length:", len(result["final"]))
        return True
    else:
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    print("=== Special Nodes Test ===\n")
    
    try:
        test_special_nodes()
        test_prompt_node_in_graph()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Flask server.")
        print("Make sure the server is running with: python app.py")
    except Exception as e:
        print(f"Error during testing: {e}") 