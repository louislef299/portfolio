<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<content>
	<p>
		Just going over the
		<a
			href="https://okanexe.medium.com/the-complete-guide-to-tcp-ip-connections-in-golang-1216dae27b5a"
			>TCP/IP basics</a
		>
		here to build out a good foundation as I continue my bluetooth journey. It never hurts to go
		over the basics, especially since there are so many tools and libraries that try to simplify
		that process for programmers.
	</p>

	<h2>TCP Basics</h2>

	<p>A TCP server requires the following steps:</p>

	<ol>
		<li>Listen for Incoming Connections</li>
		<li>Accept Incoming Connections</li>
		<li>Handle Client Connections</li>
		<li>Read and Write Data</li>
		<li>Close the Connection</li>
	</ol>

	<p>The client will:</p>

	<ol>
		<li>Dial the Server</li>
		<li>Read and Write Data</li>
		<li>Close the Connection</li>
	</ol>

	<h2>Implementation in Go</h2>

	<h3>TCP Server</h3>

	<p>
		Creating the server is a
		<a
			href="https://www.google.com/search?client=firefox-b-1-d&amp;q=how+to+create+a+simple+tcp+server+in+go"
			>simple google search</a
		>, and after a bit of consideration and fooling around, this was the final connection handler
		that I settled on:
	</p>

	<pre><code>func handleClient(conn net.Conn) {'{'}
    defer conn.Close()
    eof := false

    // Create a buffer to read data into
    buffer := make([]byte, 1024)
    for {'{'}
        // Read data from the client
        n, err := conn.Read(buffer)
        if err == io.EOF {'{'}
            eof = true
        {'}'} else if err != nil {'{'}
            log.Fatal("could not read from client connection:", err)
        {'}'}

        // Process and use the data (here, we'll just print it)
        log.Printf("buffer received: %s\n", buffer[:n])
        if eof {'{'}
            log.Println("EOF reached")
            return
        {'}'}
    {'}'}
{'}'}</code></pre>

	<h3>TCP Client</h3>

	<p>
		The client was super simple and just initiated the connection to <code>localhost:8080</code>,
		wrote <code>Hello, Server!</code> and then closed the connection. Pretty simple.
	</p>

	<h3>Building the Dockerfile</h3>

	<p>
		This was where I had a lot of fun experimenting. In order to understand why I created the
		Dockerfile the way I did, it helps to understand I created a directory under an existing
		project, so my <code>go.mod</code> and <code>go.sum</code> files were under the parent of the
		project while my Go files were under the directory structure I had created, which looked like
		the following:
	</p>

	<pre><code>.
├── go.mod
├── go.sum
├── Makefile
tcp/
├── client
│   └── main.go
├── Dockerfile
└── server
    └── main.go

3 directories, 3 files</code></pre>

	<p>
		The Dockerfile itself is variabilized so that I can build the client or server using the same
		container template(DRY):
	</p>

	<pre><code># syntax=docker/dockerfile:1
# check=error=true
FROM golang:1.23.4-alpine3.21

WORKDIR /usr/src/app

# pre-copy/cache go.mod for pre-downloading dependencies and only redownloading
# them in subsequent builds if they change
COPY go.mod go.sum ./
RUN go mod download &amp;&amp; go mod verify

ARG TCP_TARGET=server
COPY ./tcp/$TCP_TARGET .
RUN go build -v -o /usr/local/bin/app ./...

EXPOSE 8080
CMD ["app"]</code></pre>

	<p>
		Using the <code>TCP_TARGET</code> ARG helps change the <code>--build-arg</code> to
		<code>client</code> if I would want to build that go binary for whatever reason. Otherwise, it
		just defaults to <code>server</code>.
	</p>

	<p>
		One thing to note, is I take advantage of the
		<a href="https://docs.docker.com/reference/dockerfile/#check">Docker check directive</a> to
		validate proper use of the Dockerfile. It proved useful while I was writing up the Dockerfile
		and had misplaced the <code>TCP_TARGET</code> and got the following warning message:
	</p>

	<pre><code>1 warning found (use docker --debug to expand):
 - UndefinedVar: Usage of undefined variable '$TCP_TARGET' (line 13)
Dockerfile:1
--------------------
   1 | &gt;&gt;&gt; # syntax=docker/dockerfile:1
   2 |     # check=error=true
   3 |     ARG TCP_TARGET=server
--------------------
ERROR: failed to solve: lint violation found for rules: UndefinedVar
make: *** [Makefile:7: build] Error 1</code></pre>

	<p>
		This is helpful for local development as well as CI/CD to make sure other developers who may not
		be as familiar with Dockerfiles aren't messing with potentially for complex configurations.
	</p>

	<p>
		In order to simplify the container build process and reduce configuration errors, I also put
		together a quick Makefile:
	</p>

	<pre><code>DEFAULT_GOAL ?= default
TARGET ?= server

default: build run

build:
    docker build --build-arg TCP_TARGET=${'{'}TARGET{'}'} \
        -t tcp-${'{'}TARGET{'}'} -f ./tcp/Dockerfile .

run:
    docker run --rm --name ${'{'}TARGET{'}'} --network host -d tcp-${'{'}TARGET{'}'}

clean:
    docker kill ${'{'}TARGET{'}'}</code></pre>

	<p>
		One problem that I had was the TCP server not seeming to receive the client message when ran in
		the Docker network, but when run locally, it seemed to work fine. Since this was just a little
		thing to mess around with, I decided to just let it go and run the container with the
		<code>--network host</code> option. Maybe I'll come back around to it?
	</p>

	<h2>Conclusion</h2>

	<p>
		This was just a simple run-through of running a TCP server in Go and then containerizing that
		server. It seems like a simple, silly project, but this should help me get warmed up for my next
		experiment, <a href="/tech/containerized-bluetooth/">containerizing a bluetooth application</a>.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
