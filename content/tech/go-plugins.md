---
title: "gRPC Plugins in Go"
date: 2025-11-30T19:27:57-06:00
draft: false
tags:
- go
- gRPC
---

In the past, I'd taken inspiration from go's [database/sql pkg][] and
implemented a `DLogin` interface(the 'D' stands for 'Driver') that,
theoretically, allowed for compile-time [plugins][]. In my mind, this was the
first step to decoupling a lot of the business logic that I had written as a
junior engineer and would help set me up to isolating the core logic that
streamlined my OAuth requirements and the rest of the domain-specific code. As
long as any plugin that implemented `DLogin` was compiled into the final binary,
it would be a part of the tool. This poses the problem of fixed functionality
tied directly to the binary.

This was a great first step, but if I'm to actually open this tool up to others
and start recommending that the OSS community contribute to automate their
workflows, customizability & flexibility will be very important here. So, [I've
been thinking through][#817] some of my options when it comes to plugins.

When it comes to plugin solutions, there is the [native go plugin solution][],
[executable base plugins][kubectl plugins] and [rpc-based plugins][go-plugin].
Go's native runtime library solution can be finicky and has quite a few
requirements that all need to be true in order to work properly. This would be a
headache for other engineers to figure out, so that won't age well.
Executable-based plugins are extremely flexible, but make returning information
to the main process difficult and fragile. Due to these reasons, I've started
turning to RPC-based plugins, which offer program stability, simplicity and
security. These are important characteristics to a successful application, so
let's write up a small example!

## Learn by Doing: Plugins via gRPC

In my experience, Hashicorp builds(built?) great software products and is a go
powerhouse, so anything produced by them and used by their products can be
trusted to be maintained. I say this because the documentation on this library
isn't great, so I really wouldn't have used this if it wasn't used by such
important tools. But, it inspired this post, so let's dive in.

For this post, we will learn by doing and then explain what we did. If there is
anything that isn't clear while you're working through, just push through and if
it doesn't make sense at the end, just come back to the sections that need
clarity.

### Project Start

Since we are focusing on gRPC-based plugins, the following is the filesystem
structure I landed on. If you've worked much with protobufs, you'll notice I'm
ignoring the use of [buf][] here. This is intentional and I'll just assume you
know how to compile simple protos with the `justfile`.

```bash
$ tree
.
├── api
│   └── greeter.proto
├── go.mod
├── go.sum
├── justfile
├── main.go
├── plugins
└── README.md

3 directories, 6 files
```

Next, I apparently just have to follow these steps:

1. Choose the interface(s) you want to expose for plugins.
2. For each interface, implement an implementation of that interface that
   communicates over a net/rpc connection or over a gRPC connection or both.
   You'll have to implement both a client and server implementation.
3. Create a Plugin implementation that knows how to create the RPC client/server
   for a given plugin type.
4. Plugin authors call plugin.Serve to serve a plugin from the main function.
5. Plugin users use plugin.Client to launch a subprocess and request an
   interface implementation over RPC.


[#817]: https://github.com/louislef299/aws-sso/issues/817
[buf]: https://buf.build/
[database/sql pkg]: https://pkg.go.dev/database/sql
[go-plugin]: https://github.com/hashicorp/go-plugin
[kubectl plugins]: https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/
[native go plugin solution]: https://pkg.go.dev/plugin
[plugins]: https://en.wikipedia.org/wiki/Plug-in_%28computing%29
