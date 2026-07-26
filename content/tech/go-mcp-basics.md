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
model by using the [MCP tool server feature][].

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

[Cloudflare Scaling MCP]: https://blog.cloudflare.com/enterprise-mcp/
[go-adk/tools]: https://pkg.go.dev/google.golang.org/adk/v2@v2.1.0/tool
[Lightpanda]: https://lightpanda.io/
[MCP Intro]: https://modelcontextprotocol.io/docs/getting-started/intro
[MCP tool server feature]:
  https://modelcontextprotocol.io/specification/2025-11-25/server/tools
[modelcontextprotocol/go-sdk]: https://github.com/modelcontextprotocol/go-sdk
