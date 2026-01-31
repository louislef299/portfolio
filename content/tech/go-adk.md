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

---

Additional Resources:

- https://www.youtube.com/watch?v=ZaPbP9DwBOE

[AI agent]: https://huggingface.co/learn/agents-course/en/unit1/introduction
[Docker Model Runner]: https://docs.docker.com/ai/model-runner/
[Go ADK]: https://google.github.io/adk-docs/
