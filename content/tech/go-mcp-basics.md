---
title: "MCP Basics in Go"
date: 2026-07-26T14:19:42-07:00
draft: false
tags:
  - go
  - mcp
  - http
---

At work, I've been asked to help establish the MCP Gateway strategy for our
agents and I've got a few options. Not really going to worry about the
enterprise adoption patterns as [Cloudflare has covered their strategy pretty
well][Cloudflare Scaling MCP], but I do want to just cover MCP as a protocol to
make sure I understand it well. To demonstrate some of the concepts, I'm going
to leverage the [modelcontextprotocol/go-sdk][] in some code blocks so that the
theoretical can meet the practical.

## What is MCP?

Well, [here's the intro][MCP Intro]. Essentially, MCP (Model Context Protocol),
is JSON-RPC over HTTP2 and standardizes the agentic interaction with external
resources. For example, in the same way that google-adk can [leverage
tools][go-adk/tools], MCP can deliver all the required information required for
an agentic application to load external tools into the context window of the
model by using the [MCP tool server primitive][].

This was one of my biggest learning hurdles. My first experience with MCP was
enabling [Lightpanda][] in Claude Code:

```json
{
  "mcpServers": {
    "lightpanda": {
      "command": "/path/to/lightpanda",
      "args": ["mcp"]
    }
  }
}
```

What this means is: when Claude Code starts up, it leverages the stdio MCP
protocol to gather all the specifications configured and inject them into the
context window at startup. This is why context-efficient MCP is so important and
the usage should be both intentional and focused. On that same note, I've come
to only really enable 2 or 3 MCP servers at a time and manually enable other MCP
servers as I need them in a session.

Alright enough about the MCP basics, let's get our hands dirty.

## Creating a Streamable MCP Server

<!--
  This section should just go through how to setup the streamable http server
  from the mcp/go-sdk pkg. Need to choose a solid tool to demo the OAuth of mcp
  as well... I'll come back to this section
-->

## Security Concerns to be aware of

- 10 Commandments to MCP Security: https://owasp.org/www-project-mcp-top-10/

Lots of the security concerns are normal platform concerns. If you practice good
platform hygiene like least-privilege access, token-based authN, and thorough
monitoring, you're in a good position. This post will focus on the AuthN portion
of this security setup by enforcing token-based authentication to our dummy MCP
server.

### MCP-UPD Side-Quest

Might be good to talk about MCP-UPD (MCP Unintended Privacy Disclosure) and go
over some good MCP hygiene for developers thinking about adopting MCP. The arxiv
paper (bin/2509.06572v5.pdf) brings up some good points on _parasitic prompts_
that are extremely stealthy. In general, I think one thing I really think about
after considering the security vulnerability is to start thinking about the
security surface as the toolchain possibilities and not just a malicious prompt.

Provided an agent can perform websearch _and_ exfiltrate the data via email or
instant messaging or something, there is possibility for transparent, stealthy
attacks that are completely transparent to the user. Overall, this definitely is
an argument _for_ providing in-house MCP tooling so that we are confident that
we own the MCP functionality and data powering the software.

From the paper, as it applies to this post, it would be good to note that an MCP
server show try to avoid the following three types of tools:

- External Ingestion Tools (EIT) - Ingesting data into the context window. Can
  be avoided by owning the data source and not doing the equivalent of a blind
  `curl`.
- Privacy Access Tools (PAT) - This is filesystem or data access. Just don't
  grant it to a system that doesn't require it or ensure proper AuthN/AuthZ is
  implemented to secure your data.
- Network Access Tools (NAT) - Data exfiltration (`curl -X POST`). Essentially,
  avoid allowing agents to send data out unless required.

This all lives around the idea of caging the agent into a sandbox and within the
current session of the user. The trickiest part there is allowing users to read
other user's sessions, which can be avoided with RLS. Otherwise, just make sure
the agent itself is running in a filesystem that has proper access granted (not
root) and network access itself is properly configured and monitored.

After reflecting on this, even with all the proper MCP controls, these parasitic
prompts are really a big problem, and it would be great to be able to store each
session's train-of-thought by the model so that we could run detailed analysis
of any exfiltration events and exactly where agents are misbehaving.

[Cloudflare Scaling MCP]: https://blog.cloudflare.com/enterprise-mcp/
[go-adk/tools]: https://pkg.go.dev/google.golang.org/adk/v2@v2.1.0/tool
[Lightpanda]: https://lightpanda.io/
[MCP Intro]: https://modelcontextprotocol.io/docs/getting-started/intro
[MCP tool server primitive]:
  https://modelcontextprotocol.io/specification/2025-11-25/server/tools
[modelcontextprotocol/go-sdk]: https://github.com/modelcontextprotocol/go-sdk
