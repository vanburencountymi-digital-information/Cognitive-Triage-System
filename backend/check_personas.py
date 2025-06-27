#!/usr/bin/env python3
"""
Check available personas
"""

import json

with open('personas.json', 'r') as f:
    personas = json.load(f)

print("Available personas:")
for persona in personas:
    print(f"  - {persona['name']}") 