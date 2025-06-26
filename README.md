# Cognitive-Triage-System

This project is a proof of concept for a next-generation, agentic LLM system designed to support county administrators and decision makers. It provides nuanced, transparent, and bias-resistant responses to complex public sector questions, using a multi-agent workflow and a flexible persona system. The system is built with [crewAI](https://github.com/joaomdmoura/crewAI) and features a modern, interactive Gradio interface for both end-users and system designers.

## Why This System?

Large Language Models (LLMs) are powerful, but in government and policy settings, they are prone to amplifying confirmation bias, engagement bias, and context bias—especially when prompts are emotionally charged, ambiguous, or loaded. This system is designed to help county staff and administrators avoid these pitfalls by:
- Reframing questions to be clear and neutral
- Providing balanced, context-aware analysis
- Critiquing outputs for tone, completeness, and bias
- Delivering a transparent, step-by-step record of the reasoning process

## Features

- **Multi-Agent, Multi-Step Workflow:**
  - Each user prompt is processed by a sequence of specialized agents, each with a distinct role:
    1. **Prompt Reframer:** Neutralizes bias and clarifies the administrator's question.
    2. **Information Specialist:** Provides a thorough, plain-language response, drawing on policy, technical, and contextual knowledge.
    3. **Communication Analyst:** Critiques the response, surfacing strengths, weaknesses, missing perspectives, and potential issues with tone or clarity—without rewriting.
    4. **Final Editor:** Integrates the critique and the original response, producing a polished, user-ready message that addresses all identified issues.

- **Persona System:**
  - Each agent's configuration (role, goal, backstory, task description, expected output) is called a "persona."
  - Personas are saved to and loaded from a `personas.json` file, allowing persistent, reusable agent/task definitions.
  - The Gradio UI allows you to select, edit, and create new personas for each agent step, with instant updates to all dropdowns.
  - Custom personas can be created for specialized workflows (e.g., strategic problem framing, critical report analysis, policy advising).

- **Transparent, Auditable Process:**
  - The interface displays the output of each step: the reframed prompt, the initial response, the analyst's critique, and the final edited message.
  - All agent configurations and outputs are visible and editable, supporting transparency and accountability in decision making.

- **Designed for Public Sector Needs:**
  - Helps county staff and administrators avoid common LLM failure modes.
  - Supports nuanced, fair, and trustworthy decision making in complex, high-stakes environments.

## How the Process Works

1. **Prompt Reframer:**
   - The initial question or concern from the administrator is reframed into a clear, neutral, and actionable prompt. This step helps surface and neutralize any implicit bias or emotional charge, ensuring the subsequent analysis is grounded and constructive.

2. **Information Specialist:**
   - This agent provides a thorough, plain-language response to the reframed prompt, drawing on policy, technical, and contextual knowledge. The response aims to be balanced and accessible, helping the administrator understand the issue from multiple angles.

3. **Communication Analyst:**
   - Rather than rewriting, this agent critiques the specialist's response. The critique highlights strengths, weaknesses, missing perspectives, and potential issues with tone, clarity, or completeness. This step is crucial for surfacing engagement and context biases, and for ensuring the response is robust before it is used in decision making or public communication.

4. **Final Editor:**
   - The final agent integrates the critique and the original response, producing a polished, user-ready message that addresses all identified issues. This ensures the final output is not only accurate and clear, but also contextually aware and free from common LLM pitfalls.

**Custom Personas:**
- The system supports custom personas for each agent role. For example, you might use a "Problem Framer" persona to break down a strategic question into sub-questions, a "Policy and Technology Advisor" to provide balanced analysis, or a "Critical Report Analyst" to surface assumptions and blind spots in a report. These personas can be tailored to the specific needs and values of your county or department, and are easily managed through the Gradio interface.

**Result:**
- The administrator receives a transparent, step-by-step record of how their question was reframed, answered, critiqued, and finalized. This process helps avoid the most common LLM failure modes in government settings, supporting more nuanced, fair, and trustworthy decision making.

## How to Use

1. **Install dependencies** (see below).
2. **Run the app:**
   ```bash
   python main.py
   ```
3. **Open the Gradio interface** (the URL will be shown in your terminal).
4. **Enter a prompt** describing your county administration question or concern.
5. **(Optional) Customize the Crew:**
   - Expand the "Customize Crew" section.
   - For each agent, select a persona from the dropdown, or create/edit personas using the provided fields.
   - Click "Save Persona" to add it to your library (all dropdowns update instantly).
6. **Click "Run Crew"** to see the step-by-step outputs and the final, polished response.

## personas.json
- This file is automatically created and updated as you add or edit personas.
- Each persona contains all the information needed to configure an agent and its task.

## Requirements
- Python 3.8+
- crewai
- gradio
- dotenv

Install dependencies with:
```bash
pip install -r requirements.txt
```

---

This project demonstrates how agentic LLM systems can be made more robust, transparent, and user-configurable for real-world public sector applications.
