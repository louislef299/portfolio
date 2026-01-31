---
title: "Go Agent Development Kit"
date: 2026-01-30T16:49:28-06:00
draft: false
tags:
- go
- llm
---

Today, I'm going to get my hands dirty with some [AI agent][] development
leveraging the [Go ADK][] and [Docker Model Runner][]. The project itself will
be pretty basic and be an onboarding bot that standardizes the process when
provided a project. This way, I don't have to recreate the prompt every time I
start using a new project.

https://github.com/louislef299/hello-time-agent

`docker model pull ai/gemma3:latest`

https://docs.docker.com/ai/model-runner/ide-integrations/
`docker desktop enable model-runner --tcp 12434`

Wound up just getting a simple time-telling agent was harder than I would have
thought. There's enough learning there that I'll just write about it there. I'm
going to have to do a lot of reading to figure out how this was accomplished
since I vibed out most of it.

**Building an Agent with Google ADK - A Simplified Guide (Based on Your Code)**

The Google ADK provides a streamlined approach to deploying AI agents, allowing you to leverage LLMs like Llama 2 without managing the underlying infrastructure. Here’s how to build a basic agent using your provided code:

**1. Core Components:**

*   **Docker Model Runner:** This is the foundation. It provides the containerized environment for running the LLM.
*   **`NewDockerModel()`:** Creates an instance of the LLM adapter, connecting to the remote LLM service.
*   **`llmagent.New()`:**  Creates the agent object, linking it to the LLM and defining its behavior.

**2. Agent Configuration:**

*   **`Instruction`:** Defines the agent's role and how it should behave ("You are a helpful assistant...").
*   **`Tools`:**  A list of tools the agent can use. Your example uses the `get_current_time` tool.
*   **`FunctionTool`:**  Each tool is defined with a name, description, and the function that implements its logic.

**3. Prompt Engineering & Orchestration:**

*   **`buildMessages()`:** This function is critical. It structures the conversation, incorporating system instructions and user input.  It’s responsible for formatting the prompt for the LLM.
*   **`GenerateContent()`:** This function handles the interaction with the LLM, sending the prompt, receiving the response, and formatting the output.

**4. Execution:**

*   **`full.NewLauncher().Execute()`:**  This launches the agent, triggering the entire workflow.

**Key Considerations & Best Practices:**

*   **Tool Selection:** Carefully choose tools based on the agent’s desired functionality.
*   **Prompt Design:**  Craft clear and concise prompts to guide the LLM’s behavior.
*   **Context Management:**  Consider how to manage conversation history and maintain context across multiple turns.
*   **Error Handling:** Implement robust error handling to gracefully handle unexpected issues.

**Your Code as a Starting Point:**

Your code provides a solid foundation for building more complex agents. You can easily expand it by:

*   Adding more tools.
*   Implementing more sophisticated prompt engineering techniques.
*   Integrating with external data sources.

**Resources:**

*   [Google ADK Documentation](https://cloud.google.com/vertex-ai/docs/agent)
*   [Google ADK GitHub Repository](https://github.com/GoogleCloudPlatform/google-adk)

---

Additional Resources:

- https://www.youtube.com/watch?v=ZaPbP9DwBOE

[AI agent]: https://huggingface.co/learn/agents-course/en/unit1/introduction
[Docker Model Runner]: https://docs.docker.com/ai/model-runner/
[Go ADK]: https://google.github.io/adk-docs/
