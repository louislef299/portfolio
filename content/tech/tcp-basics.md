---
title: "TCP/IP Basics"
date: 2024-12-26T13:18:58-06:00
draft: false
tags:
- go
- tcp
---

<!-- markdownlint-disable MD013 MD052 MD034 -->

Just going over the [TCP/IP basics][] here to build out a good foundation as I
continue my bluetooth journey. It never hurts to go over the basics, especially
since there are so many tools and libraries that try to simplify that process
for programmers.

## TCP Basics

A TCP server requires the following steps:

1. Listen for Incoming Connections
2. Accept Incoming Connections
3. Handle Client Connections
4. Read and Write Data
5. Close the Connection

The client will:

1. Dial the Server
2. Read and Write Data
3. Close the Connection

## Implementation in Go

### TCP Server

Creating the server is a [simple google search][tcp server google], and after a
bit of consideration and fooling around, this was the final connection handler
that I settled on:

```go
func handleClient(conn net.Conn) {
    defer conn.Close()
    eof := false

    // Create a buffer to read data into
    buffer := make([]byte, 1024)
    for {
        // Read data from the client
        n, err := conn.Read(buffer)
        if err == io.EOF {
            eof = true
        } else if err != nil {
            log.Fatal("could not read from client connection:", err)
        }

        // Process and use the data (here, we'll just print it)
        log.Printf("buffer received: %s\n", buffer[:n])
        if eof {
            log.Println("EOF reached")
            return
        }
    }
}
```

### TCP Client

The client was super simple and just initiated the connection to
`localhost:8080`, wrote `Hello, Server!` and then closed the connection. Pretty
simple.

### Building the Dockerfile

This was where I had a lot of fun experimenting. In order to understand why I
created the Dockerfile the way I did, it helps to understand I created a
directory under an existing project, so my `go.mod` and `go.sum` files were
under the parent of the project while my Go files were under the directory
structure I had created, which looked like the following:

```bash
.
├── go.mod
├── go.sum
├── Makefile
tcp/
├── client
│   └── main.go
├── Dockerfile
└── server
    └── main.go

3 directories, 3 files
```

The Dockerfile itself is variabilized so that I can build the client or server
using the same container template(DRY):

```dockerfile
# syntax=docker/dockerfile:1
# check=error=true
FROM golang:1.23.4-alpine3.21

WORKDIR /usr/src/app

# pre-copy/cache go.mod for pre-downloading dependencies and only redownloading
# them in subsequent builds if they change
COPY go.mod go.sum ./
RUN go mod download && go mod verify

ARG TCP_TARGET=server
COPY ./tcp/$TCP_TARGET .
RUN go build -v -o /usr/local/bin/app ./...

EXPOSE 8080
CMD ["app"]
```

Using the `TCP_TARGET` ARG helps change the `--build-arg` to `client` if I would
want to build that go binary for whatever reason. Otherwise, it just defaults to
`server`.

One thing to note, is I take advantage of the [Docker check directive][] to
validate proper use of the Dockerfile. It proved useful while I was writing up
the Dockerfile and had misplaced the `TCP_TARGET` and got the following warning
message:

```bash
1 warning found (use docker --debug to expand):
 - UndefinedVar: Usage of undefined variable '$TCP_TARGET' (line 13)
Dockerfile:1
--------------------
   1 | >>> # syntax=docker/dockerfile:1
   2 |     # check=error=true
   3 |     ARG TCP_TARGET=server
--------------------
ERROR: failed to solve: lint violation found for rules: UndefinedVar
make: *** [Makefile:7: build] Error 1
```

This is helpful for local development as well as CI/CD to make sure other
developers who may not be as familiar with Dockerfiles aren't messing with
potentially for complex configurations.

In order to simplify the container build process and reduce configuration
errors, I also put together a quick Makefile:

```makefile
DEFAULT_GOAL ?= default
TARGET ?= server

default: build run

build:
    docker build --build-arg TCP_TARGET=${TARGET} \
        -t tcp-${TARGET} -f ./tcp/Dockerfile .

run:
    docker run --rm --name ${TARGET} --network host -d tcp-${TARGET}

clean:
    docker kill ${TARGET}
```

One problem that I had was the TCP server not seeming to receive the client
message when ran in the Docker network, but when run locally, it seemed to work
fine. Since this was just a little thing to mess around with, I decided to just
let it go and run the container with the `--network host` option. Maybe I'll
come back around to it?

## Conclusion

This was just a simple run-through of running a TCP server in Go and then
containerizing that server. It seems like a simple, silly project, but this
should help me get warmed up for my next experiment, [containerizing a bluetooth
application][].

[containerizing a bluetooth application]: {{< ref "/tech/containerized-bluetooth.md" >}}
[Docker check directive]: <https://docs.docker.com/reference/dockerfile/#check>
[tcp server google]: <https://www.google.com/search?client=firefox-b-1-d&q=how+to+create+a+simple+tcp+server+in+go>
[TCP/IP basics]: <https://okanexe.medium.com/the-complete-guide-to-tcp-ip-connections-in-golang-1216dae27b5a>
