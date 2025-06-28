#!/usr/bin/env python3
"""
Test script for the blank nodes feature
"""

import requests
import json
import os

BASE_URL = "http://localhost:5000"

def test_blank_nodes_validation():
    """Test that the backend correctly rejects workflows with blank nodes"""
    print("Testing blank nodes validation...")
    
    # Create a graph with one blank node
    graph_data = {
        "nodes": [
            {
                "id": "blank_node",
                "persona": "",  # Blank persona
                "role": "Agent"
            },
            {
                "id": "valid_node",
                "persona": "Default Civic Information Specialist",
                "role": "Civic Information Specialist"
            }
        ],
        "edges": [
            {"source": "valid_node", "target": "blank_node"}
        ]
    }
    
    # Use a valid API key from environment or a test key
    api_key = os.getenv('OPENAI_API_KEY', 'sk-test-key')
    
    payload = {
        "graph": graph_data,
        "user_prompt": "Test prompt",
        "user_api_key": api_key
    }
    
    print("Sending request with blank node...")
    response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 400:
        result = response.json()
        error_message = result.get('error', '')
        print(f"Error message: {error_message}")
        
        if "without personas assigned" in error_message and "blank_node" in error_message:
            print("✅ SUCCESS: Backend correctly rejected workflow with blank nodes")
            return True
        else:
            print("❌ FAILED: Backend did not provide expected blank nodes error")
            print(f"Expected: 'without personas assigned' and 'blank_node'")
            print(f"Got: {error_message}")
            return False
    else:
        print("❌ FAILED: Expected 400 status code for blank nodes")
        print(f"Got status: {response.status_code}")
        if response.status_code != 200:
            try:
                result = response.json()
                print(f"Error: {result.get('error', 'Unknown error')}")
            except:
                print(f"Response text: {response.text[:200]}")
        return False

def test_valid_workflow():
    """Test that a valid workflow still works"""
    print("\nTesting valid workflow...")
    
    graph_data = {
        "nodes": [
            {
                "id": "valid_node",
                "persona": "Default Civic Information Specialist",
                "role": "Civic Information Specialist"
            }
        ],
        "edges": []
    }
    
    # Use a valid API key from environment or a test key
    api_key = os.getenv('OPENAI_API_KEY', 'sk-test-key')
    
    payload = {
        "graph": graph_data,
        "user_prompt": "Test prompt",
        "user_api_key": api_key
    }
    
    print("Sending request with valid workflow...")
    response = requests.post(
        f"{BASE_URL}/api/run-crew-graph",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 400:
        result = response.json()
        error_message = result.get('error', '')
        print(f"Error message: {error_message}")
        
        # Should fail on API key validation, not blank nodes
        if "API key" in error_message:
            print("✅ SUCCESS: Valid workflow passed blank nodes validation (failed on API key as expected)")
            return True
        else:
            print("❌ FAILED: Valid workflow failed with unexpected error")
            return False
    elif response.status_code == 200:
        print("✅ SUCCESS: Valid workflow executed successfully")
        return True
    else:
        print("❌ FAILED: Unexpected status code")
        try:
            result = response.json()
            print(f"Error: {result.get('error', 'Unknown error')}")
        except:
            print(f"Response text: {response.text[:200]}")
        return False

def test_health_check():
    """Test that the backend is accessible"""
    print("Testing backend connectivity...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ SUCCESS: Backend is accessible")
            return True
        else:
            print(f"❌ FAILED: Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Cannot connect to backend")
        return False

if __name__ == "__main__":
    print("=== Blank Nodes Feature Test ===\n")
    
    try:
        if not test_health_check():
            print("Backend is not accessible. Please ensure it's running.")
            exit(1)
            
        test_blank_nodes_validation()
        test_valid_workflow()
        
        print("\nAll tests completed!")
        
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc() 