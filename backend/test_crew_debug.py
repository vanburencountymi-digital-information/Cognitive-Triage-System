#!/usr/bin/env python3
"""
Debug script to test CrewAI functionality locally
"""

import os
import sys
import json
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

def test_crewai_import():
    """Test if CrewAI can be imported"""
    try:
        from crewai import Agent, Task, Crew, Process
        logging.info("✅ CrewAI imports successful")
        return True
    except ImportError as e:
        logging.error(f"❌ CrewAI import failed: {e}")
        return False

def test_openai_connection(api_key):
    """Test OpenAI connection"""
    try:
        import openai
        openai.api_key = api_key
        
        # Test with a simple API call
        response = openai.models.list()
        logging.info("✅ OpenAI connection successful")
        return True
    except Exception as e:
        logging.error(f"❌ OpenAI connection failed: {e}")
        return False

def test_simple_crew(api_key):
    """Test a simple crew execution"""
    try:
        from crewai import Agent, Task, Crew, Process
        import openai
        
        openai.api_key = api_key
        
        # Create a simple test agent
        test_agent = Agent(
            role="Test Agent",
            goal="Test that CrewAI is working",
            backstory="A simple test agent to verify functionality",
            verbose=True,
            allow_delegation=False
        )
        
        # Create a simple test task
        test_task = Task(
            description="Say 'Hello, CrewAI is working!'",
            agent=test_agent,
            expected_output="A simple greeting message"
        )
        
        # Create and run a simple crew
        crew = Crew(
            agents=[test_agent],
            tasks=[test_task],
            process=Process.sequential,
            verbose=True
        )
        
        logging.info("Starting simple crew test...")
        result = crew.kickoff()
        logging.info(f"✅ Simple crew test successful: {result}")
        return True
        
    except Exception as e:
        logging.error(f"❌ Simple crew test failed: {e}")
        import traceback
        logging.error(f"Full traceback: {traceback.format_exc()}")
        return False

def test_personas():
    """Test persona loading"""
    try:
        from app import load_personas, find_persona_by_name
        
        personas = load_personas()
        logging.info(f"✅ Loaded {len(personas)} personas")
        
        if personas:
            # Test finding a specific persona
            first_persona = personas[0]
            persona_name = first_persona.get('name', '')
            if persona_name:
                found_persona = find_persona_by_name(persona_name)
                if found_persona:
                    logging.info(f"✅ Found persona: {persona_name}")
                else:
                    logging.warning(f"⚠️ Could not find persona: {persona_name}")
        
        return True
    except Exception as e:
        logging.error(f"❌ Persona test failed: {e}")
        return False

def main():
    """Run all tests"""
    logging.info("🧪 Starting CrewAI Debug Tests")
    
    # Get API key from environment or user input
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        api_key = input("Enter your OpenAI API key: ").strip()
    
    if not api_key:
        logging.error("❌ No API key provided")
        return False
    
    # Run tests
    tests = [
        ("CrewAI Import", test_crewai_import),
        ("OpenAI Connection", lambda: test_openai_connection(api_key)),
        ("Persona Loading", test_personas),
        ("Simple Crew", lambda: test_simple_crew(api_key)),
    ]
    
    results = []
    for test_name, test_func in tests:
        logging.info(f"\n🔍 Running {test_name} test...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logging.error(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    logging.info("\n📊 Test Results Summary:")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logging.info(f"  {test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        logging.info("\n🎉 All tests passed! CrewAI should be working correctly.")
    else:
        logging.error("\n💥 Some tests failed. Check the logs above for details.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 