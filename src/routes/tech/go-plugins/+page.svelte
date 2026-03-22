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
		In the past, I'd taken inspiration from go's
		<a href="https://pkg.go.dev/database/sql">database/sql pkg</a> and implemented a
		<code>DLogin</code> interface(the 'D' stands for 'Driver') that, theoretically, allowed for
		compile-time <a href="https://en.wikipedia.org/wiki/Plug-in_%28computing%29">plugins</a>. In my
		mind, this was the first step to decoupling a lot of the business logic that I had written as a
		junior engineer and would help set me up to isolating the core logic that streamlined my OAuth
		requirements and the rest of the domain-specific code. As long as any plugin that implemented
		<code>DLogin</code> was compiled into the final binary, it would be a part of the tool. I eventually
		ran into the problem of fixed functionality tied directly to the binary. This would mean I need to
		run a full release to get new functionality out to my users, which poses a problem if more and more
		contributors implement the interface with their own imagination.
	</p>

	<p>
		This was a great first step, but if I'm to actually open this tool up to others and start
		recommending that the OSS community contribute to automate their workflows, customizability &amp;
		flexibility will be very important here. So,
		<a href="https://github.com/louislef299/aws-sso/issues/817">I've been thinking through</a> some of
		my options when it comes to plugins.
	</p>

	<p>
		When it comes to plugin solutions, there is the
		<a href="https://pkg.go.dev/plugin">native go plugin solution</a>,
		<a href="https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/"
			>executable base plugins</a
		>
		and <a href="https://github.com/hashicorp/go-plugin">rpc-based plugins</a>. Go's native runtime
		library solution can be finicky and has quite a few requirements that all need to be true in order
		to work properly. This would be a headache for other engineers to figure out, so that won't age
		well. Executable-based plugins are extremely flexible, but make returning information to the main
		process difficult and fragile. Due to these reasons, I've started turning to RPC-based plugins,
		which offer program stability, simplicity and security. These are important characteristics to a
		successful application, so let's write up a small example!
	</p>

	<h2>Learn by Doing: A Greeter Plugin using gRPC</h2>

	<p>
		In my experience, Hashicorp builds(built?) great software products and is a go powerhouse, so
		anything produced by them and used by their products can be trusted to be maintained. I say this
		because the documentation on this library isn't great, so I really wouldn't have used this if it
		wasn't used by such foundational tools.
	</p>

	<p>
		For this post, we will learn by doing and then explain concepts along the way. If there is
		anything that isn't clear while you're working through, just push through and if it doesn't make
		sense at the end, just come back to the sections that need clarity.
	</p>

	<h3>Project Setup</h3>

	<p>
		GitHub location: <a href="https://github.com/louislef299/greeter-plugin">greeter-plugin</a>
	</p>

	<p>
		Since we are focusing on gRPC-based plugins, the following is the filesystem structure I landed
		on. If you've worked much with protobufs, you'll notice I'm ignoring the use of
		<a href="https://buf.build/">buf</a> here. This is intentional and I'll just assume you know how
		to compile simple protos. Reference the <code>justfile</code> if you get stuck.
	</p>

	<pre><code class="language-bash">$ tree
.
├── api
│   └── greeter.proto
├── go.mod
├── go.sum
├── justfile
├── main.go
├── plugins
│   └── main.go
├── README.md
└── shared
    └── interface.go

4 directories, 10 files</code></pre>

	<p>
		Next, I
		<a href="https://github.com/hashicorp/go-plugin/tree/main?tab=readme-ov-file#usage"
			>apparently</a
		> just have to follow these steps:
	</p>

	<blockquote>
		<ol>
			<li>Choose the interface(s) you want to expose for plugins.</li>
			<li>
				For each interface, implement an implementation of that interface that communicates over a
				net/rpc connection or over a gRPC connection or both. You'll have to implement both a client
				and server implementation.
			</li>
			<li>
				Create a Plugin implementation that knows how to create the RPC client/server for a given
				plugin type.
			</li>
			<li>Plugin authors call plugin.Serve to serve a plugin from the main function.</li>
			<li>
				Plugin users use plugin.Client to launch a subprocess and request an interface implementation
				over RPC.
			</li>
		</ol>
	</blockquote>

	<h3>Defining the Interface(1)</h3>

	<p>
		The proto structure I've chosen for this example is dead simple. It expects a
		<code>Person</code> and returns a <code>Greeting</code> based on the person's name.
	</p>

	<pre><code class="language-proto">// api/greeter.proto
// This service will actually get called by our main process
service Greeter {'{'}
    rpc Greet(Person) returns (Greeting);
{'}'}

message Person {'{'}
  string name = 1;
{'}'}

message Greeting {'{'}
  string message = 1;
{'}'}</code></pre>

	<p>And the interface is even simpler:</p>

	<pre><code class="language-go">// shared/interface.go
// Greet is the interface that we're exposing as a plugin
type Greet interface {'{'}
   Greet(name string) string
{'}'}</code></pre>

	<h3>Implementing the Interface(2)</h3>

	<p>
		Next, we have to implement the <code>Greeter</code> interface that communicates over gRPC. If
		you've worked with gRPC before, you know that this obviously requires setting up a client and a
		server. We are starting to require a bit more understanding about how this plugin library works,
		let's go over it quickly.
	</p>

	<img
		src="/image/tech/go-plugins/plugin-rpc-binaries.png"
		alt="https://eli.thegreenplace.net/2023/rpc-based-plugins-in-go/"
		loading="lazy"
	/>

	<p>
		Pretend each rpc above is replaced with gRPC. There is a main process responsible for the
		lifecycle of child processes with <code>cmd.Exec()</code>(remember <code>fork()</code>?). Once a
		child process is spun up, communication over gRPC can begin, but we must initiate this
		communication as a <em>client</em>. Each plugin process acts as a <em>server</em> but has its
		lifecycle managed by the main process.
	</p>

	<p>Got it? Here are the implementations:</p>

	<pre><code class="language-go">// shared/interface.go

// GRPCClient is an implementation of Greet that talks over RPC
type GRPCClient struct {'{'}
   client api.GreeterClient
{'}'}

// The GRPCClient actually expects a gRPC client and sends the Greet request
// over the wire
func (c *GRPCClient) Greet(name string) string {'{'}
   g, err := c.client.Greet(context.Background(), &amp;api.Person{'{'}
      Name: name,
   {'}'})
   if err != nil {'{'}
     panic(err)
   {'}'}
   return g.Message
{'}'}

// Here is the gRPC server that GRPCClient talks to.
type GRPCServer struct {'{'}
   api.UnimplementedGreeterServer
   // This is the real interface implementation
   Impl Greeter
{'}'}

// Looks more like the actual gRPC signature, right?
func (s *GRPCServer) Greet(ctx context.Context,
   p *api.Person) (*api.Greeting, error) {'{'}
   return &amp;api.Greeting{'{'}
      Message: s.Impl.Greet(p.Name),
   {'}'}, nil
{'}'}</code></pre>

	<h3>Implement Plugin(3)</h3>

	<p>
		<a href="https://pkg.go.dev/github.com/hashicorp/go-plugin?utm_source=godoc#Plugin">Plugin</a> is
		a relatively simple interface. It is responsible for brokering the communication between the
		processes, but allows for the standardization of execution by
		<code>go-plugin</code>.
	</p>

	<pre><code class="language-go">// This is the implementation of plugin.Plugin so we can serve/consume this.
type GreetPlugin struct {'{'}
   plugin.Plugin
   // Concrete implementation, written in Go. This is only used for plugins
   // that are written in Go.
   Impl Greeter
{'}'}

// GRPCServer registers the Greeter service with the plugin's gRPC server.
// Called in the plugin process to expose the implementation over RPC.
func (p *GreetPlugin) GRPCServer(broker *plugin.GRPCBroker,
   s *grpc.Server) error {'{'}
   api.RegisterGreeterServer(s, &amp;GRPCServer{'{'}Impl: p.Impl{'}'})
   return nil
{'}'}

// GRPCClient creates a client that calls the plugin's Greeter service over gRPC.
// Called in the host process to create a Go interface backed by RPC calls.
func (p *GreetPlugin) GRPCClient(ctx context.Context,
   broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{'{'}{'}'}, error) {'{'}
   return &amp;GRPCClient{'{'}client: api.NewGreeterClient(c){'}'}, nil
{'}'}</code></pre>

	<h3>Serve the Plugin(4)</h3>

	<p>
		The following actually implements the <code>Greeter</code> interface and serves the plugin as its
		only function, passing the <code>Greet</code> structure as the official <code>Greeter</code>
		implementation.
	</p>

	<pre><code class="language-go">// plugins/main.go
type Greet struct{'{'}{'}'}{'\n'}
func (Greet) Greet(name string) string {'{'}
   // This proves the plugin process is doing the work
   os.WriteFile("./greet-plugin-called", []byte(name), 0644)
   return fmt.Sprintf("hello %s", name)
{'}'}

func main() {'{'}
   plugin.Serve(&amp;plugin.ServeConfig{'{'}
      HandshakeConfig: shared.Handshake,
      GRPCServer: plugin.DefaultGRPCServer,
      Plugins: map[string]plugin.Plugin{'{'}
         "greet": &amp;shared.GreetPlugin{'{'}Impl: &amp;Greet{'{'}{'}'}{'}'},
      {'}'},
   {'}'})
{'}'}</code></pre>

	<h3>Tie it all Together with plugin.Client(5)</h3>

	<p>
		Finally, we just have to implement our root main function and leverage
		<code>plugin.Client</code> to manage the lifecycle of executing the application, connecting to it,
		and returning the RPC client for dispensing plugins.
	</p>

	<pre><code class="language-go">// We're a host. Start by launching the plugin process.
client := plugin.NewClient(&amp;plugin.ClientConfig{'{'}
   HandshakeConfig:  shared.Handshake,
   Plugins:          shared.PluginMap,
   Cmd:              exec.Command("sh", "-c", "./greet"),
   AllowedProtocols: []plugin.Protocol{'{'}plugin.ProtocolGRPC{'}'},
{'}'})
defer client.Kill()

// Connect via gRPC
rpcClient, err := client.Client()
if err != nil {'{'}
   log.Fatal(err)
{'}'}

// Request the plugin
raw, err := rpcClient.Dispense("greet")
if err != nil {'{'}
   log.Fatal(err)
{'}'}

// We should have a Greeter now! This feels like a normal interface
// implementation but is in fact over an RPC connection.
g := raw.(shared.Greeter)
os.Args = os.Args[1:]
log.Println("response from plugin:", g.Greet(os.Args[0]))</code></pre>

	<h2>Conclusion</h2>

	<p>
		This was a great way to learn how to use <code>go-plugin</code> and hopefully you can begin to see
		the value of this library. If you have used any of the hashicorp products, this post hopefully was
		a look under the hood at how they implemented some of their amazing plugin solutions like
		<a href="https://registry.terraform.io/">Terraform Registry</a> or the
		<a href="https://developer.hashicorp.com/vault/docs/plugins">Vault Plugin Ecosystem</a>.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
