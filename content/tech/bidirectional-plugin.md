---
title: "Bidirectional gRPC Plugins"
date: 2025-12-05T06:37:28-06:00
draft: false
tags:
- go
- gRPC
- hashi
---

<!-- markdownlint-disable MD052 -->

Today, we're going to build on the [previous post][] and update the `Greeter` to
allow for bidirectional communication. I was considering just head-on back into
implementing the `go-plugin` system into my project, but figured it would be
better to play around with the library a bit more on a smaller scale. So, not
only am I going to cover [bidirectional gRPC][] plugins, I'll also explore any
additional nuances of the `go-plugin` library to build on existing knowledge.

[bidirectional gRPC]: https://grpc.io/docs/what-is-grpc/core-concepts/#bidirectional-streaming-rpc

[previous post]: {{< ref "/tech/go-plugins.md" >}}
