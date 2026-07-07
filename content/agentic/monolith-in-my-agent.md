---
title: "The Monolith in My Agent"
date: 2026-07-06T09:00:00-05:00
draft: false
tags:
  - ai
  - agents
  - llm
---

<!-- markdownlint-disable MD052 -->

I got priced out of the frontier models at work. Not gone — just rationed enough
that I couldn't keep pointing the biggest, most expensive model at every little
thing. My first thought was that my documentation workflow was dead.

My second, better thought: it was never a workflow. It was a monolith, and the
model was just big enough to hide it.

## One model, four jobs

The setup was slick while it lasted. A single agent, in a single session, kept
my knowledge base alive: it wrote the prose, held the whole link graph of an
interconnected site in its head, conformed every page to the right archetype and
frontmatter, and ran admin over the search index. It felt like magic because one
model could hold all of it at once.

Take that model away and the whole thing falls over. Not because the task got
harder overnight — because I never made the task legible to anything smaller.
I'd been buying intelligence to avoid building structure, and I didn't notice
until the intelligence got expensive.

## Split by difficulty, not by volume

Here's the reframe that saved the workflow. When people talk about cutting model
costs, they usually mean _volume_ — fewer calls, or the same work on a cheaper
model, and hope. That's the wrong axis. The right one is _difficulty_.

Most of what an agentic KB does is schema-constrained plumbing. Correct
frontmatter, valid links, archetype conformance, taxonomy placement, index
upkeep — none of that needs a frontier model. It needs tooling I hadn't built,
because the big model let me skip building it. Only one layer actually reasons —
turning a gnarly debugging session into a guide someone else can follow. That's
the part that earns a good model, and it's the smallest part by far.

```text
THE MONOLITH — one session, one big model, doing it all at once:

    author + hold the link graph + conform to archetypes + run index admin

DECOMPOSED — split by difficulty, not by volume:

    capture     no model    shell history, git commits, k8s logs, a note
    structure   no model    schemas + linters, not a model's memory
    retrieve    small model vector + graph search over the KB
    author      good model  the one thin layer that still earns it
```

The capture layer is the one I'd underinvested in most, and losing it hurt the
worst. My day used to document itself as a side effect of those big sessions.
Strip them out and suddenly the work only lives in my head — the bug I chased
for three hours, the reason we picked one mesh config over another. No model,
however good, can write up a day it never saw. So that layer runs on nothing
fancy: shell history, my commit messages, a scratch file left open. Cheap, dumb,
always on.

## What the constraint taught me

The constraint did me a favor. A workflow only one expensive model can run is a
workflow exactly one person can afford to run. Broken into layers, most of it
runs on hardware I already own, and the good model only shows up for the
paragraph that genuinely needs it. That's the difference between a trick I can
do and a thing my team can keep — which, if I've learned anything about treating
a [platform as a product][], is the only kind of thing worth building.

Turns out I default to defense-in-depth for [everything][block the bots], agents
included. Who knew.

---

## _Colophon_

This post was written the way it argues you should write. The raw material was a
messy late-night conversation about getting rationed off the good models —
_capture_. It got dropped into this site's archetype, frontmatter, and tags —
_structure_. The voice came from reading back through the archive here —
_retrieval_ — and only the sentences were left for a model to actually write —
_authoring_. Four layers, one of them expensive. Most of what you just read came
cheap.

— signed, _Claude_ — the model that wrote the sentences, but not the structure
🤖

[platform as a product]: {{< ref "/tech/platform-engineering.md" >}} 
[block the bots]: {{< ref "/tech/block-bots.md" >}}
