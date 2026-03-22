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
		Alright, so in the past, I had gotten low enough to the system level with BlueZ that I had
		pondered learning the basics of DBus(<a href="/tech/containerized-bluetooth/">containerized ble</a
		>). After working a bit with the popular Go bluetooth pkg from tinygo, I was having some problems
		with it and not getting quite getting it to work how I wanted it to, so looks like I get to learn
		about DBus to help with debugging and potentially reimplement my own bluetooth Go pkg.
	</p>

	<h2>What is DBus?</h2>

	<p>
		In short, it is a generic Inter-Process Communication(IPC) used by Linux and other operating
		systems and leveraging Unix domain sockets(AF_UNIX) or TCP/IP(AF_INET).
	</p>

	<img
		src="/image/tech/learn-dbus/linux-dbus.jpg"
		alt="Linux DBus Architecture"
		loading="lazy"
	/>

	<p>
		From
		<a
			href="http://0pointer.net/blog/the-new-sd-bus-api-of-systemd.html?source=post_page-----e4039c4f17dc--------------------------------"
			>Pid Eins</a
		> on why DBus even exists:
	</p>

	<blockquote>
		...what AF_UNIX/FIFOs are to DBus, TCP is to HTTP/REST. While AF_UNIX sockets/FIFOs only shovel
		raw bytes between processes, DBus defines actual message encoding and adds concepts like method
		call transactions, an object system, security mechanisms, multicasting and more
	</blockquote>

	<p>
		<a
			href="http://0pointer.net/blog/the-new-sd-bus-api-of-systemd.html?source=post_page-----e4039c4f17dc--------------------------------"
			>Pid Eins</a
		> offers a super helpful introduction to DBus concepts &amp; terms, so I would recommend running
		over there quickly to review the terms if you are unfamiliar. Here is a reference to some of the
		<a href="https://dbus.freedesktop.org/doc/dbus-specification.html#standard-interfaces"
			>standard interfaces</a
		> DBus provides.
	</p>

	<h2>Interacting with DBus through the CLI</h2>

	<p>
		Interacting with DBus is nice and easy with <code>busctl</code>. However, in order to fully
		understand DBus, I'm going to try and use the native
		<a href="https://linux.die.net/man/1/dbus-send">dbus-send</a> cli.
	</p>

	<h3>Listing Services</h3>

	<p>
		First thing's first, I'm going to list the active connections on the session bus by calling the
		<code>ListNames</code> method of the <code>/org/freedesktop/DBus</code> object at the
		<code>org.freedesktop.DBus</code> service. The <code>org.freedesktop.DBus</code> interface exposes
		the <code>ListNames</code> method, allowing us to call
		<code>org.freedesktop.DBus.ListNames</code>:
	</p>

	<pre><code class="language-bash">dbus-send --session --dest=org.freedesktop.DBus \
  --type=method_call --print-reply /org/freedesktop/DBus \
  org.freedesktop.DBus.ListNames</code></pre>

	<p>The two types of bus names that are returned:</p>

	<ol>
		<li>Unique Name(:1.685)</li>
		<li>Well-Known Name(org.bluez)</li>
	</ol>

	<p>
		All DBus clients have a unique name, but services with a well-known name are easier to access.
		Well-known names are similar to DNS in that they are only used for message routing.
	</p>

	<p>
		It looks like you can also find out what services exist in the DBus configuration under
		<code>/usr/share/dbus-1/services</code>. One important note is when interacting the services on
		the DBus, make sure you are sending those messages on the correct bus. For instance, BlueZ will
		typically be using the system bus.
	</p>

	<h3>Introspection</h3>

	<p>
		DBus comes with the
		<a href="https://www.gnu.org/software/emacs/manual/html_node/dbus/Introspection.html"
			>ability to analyze</a
		> their published interfaces, methods, signals and properties at runtime using introspection.
		While the <code>dbus-send</code> tool is powerful, I've found it's easier to start with
		<code>busctl</code>. Here's how to list all of the objects and introspect a BlueZ service:
	</p>

	<pre><code class="language-bash">$ busctl tree org.bluez
└─ /org
  └─ /org/bluez
    └─ /org/bluez/hci0
$ busctl introspect org.bluez /org/bluez/hci0
NAME                                TYPE      SIGNATURE RESULT/VALUE                             FLAGS
org.bluez.Adapter1                  interface -         -                                        -
.SetDiscoveryFilter                 method    a{'{'}sv{'}'}     -                                        -
.StartDiscovery                     method    -         -                                        -
.StopDiscovery                      method    -         -                                        -
...
org.freedesktop.DBus.Introspectable interface -         -                                        -
.Introspect                         method    -         s                                        -
org.freedesktop.DBus.Properties     interface -         -                                        -
.Get                                method    ss        v                                        -
.GetAll                             method    s         a{'{'}sv{'}'}</code></pre>

	<p>
		This command returns the methods, properties and signals of the bluetooth service. The specific
		type notation can be found
		<a href="https://pythonhosted.org/txdbus/dbus_overview.html">here</a>, but here are the
		<a href="#reference-dbus-signatures">signatures</a>.
	</p>

	<p>
		Using <code>dbus-send</code> provides some helpful insight into the arguments that are passed to
		the methods. For instance, here is the xml data for the <code>SetDiscoveryFilter</code> method:
	</p>

	<pre><code class="language-bash">dbus-send --system --dest=org.bluez --type=method_call --print-reply \
    /org/bluez/hci0 org.freedesktop.DBus.Introspectable.Introspect</code></pre>

	<p>returns:</p>

	<pre><code class="language-xml">&lt;method name="SetDiscoveryFilter"&gt;
    &lt;arg name="properties" type="a{'{'}sv{'}'}" direction="in"/&gt;
&lt;/method&gt;</code></pre>

	<h3>Calling a DBus Service Method</h3>

	<p>
		To call a super simple method from the <code>org.bluez</code> service, I just chose the
		<code>StartDiscovery</code> method since it doesn't take any input parameters. Just run:
	</p>

	<pre><code class="language-bash">busctl call org.bluez /org/bluez/hci0 org.bluez.Adapter1 StartDiscovery</code></pre>

	<p>or with <code>dbus-send</code>:</p>

	<pre><code class="language-bash">dbus-send --system --dest=org.bluez --type=method_call --print-reply \
    /org/bluez/hci0 org.bluez.Adapter1.StartDiscovery
method return time=1736121400.427641 sender=:1.4 -&gt; destination=:1.368 serial=1054 reply_serial=2</code></pre>

	<p>
		Here is how you can access a DBus property, in this example, getting the bluetooth adapter name:
	</p>

	<pre><code class="language-bash">dbus-send --system --dest=org.bluez --type=method_call --print-reply \
    /org/bluez/hci0 org.freedesktop.DBus.Properties.Get \
    string:"org.bluez.Adapter1" string:"Name"
method return time=1736121705.000813 sender=:1.4 -&gt; destination=:1.370 serial=1059 reply_serial=2
   variant       string "louarch"</code></pre>

	<h2>Signal Example in Go</h2>

	<p>
		Since I was having the most problems with signals using BlueZ, I'm going to run through a quick
		DBus signal example using the
		<a href="https://pkg.go.dev/github.com/godbus/dbus">Go DBus pkg</a> by
		<a href="https://nyirog.medium.com/register-dbus-service-f923dfca9f1"
			>registering my own DBus service</a
		> and monitoring for signals.
	</p>

	<p>
		This article is getting a bit large, however, so I'm going to work with DBus in Go in a
		different article.
	</p>

	<h2 id="reference-dbus-signatures">Reference: DBus Signatures</h2>

	<table>
		<thead>
			<tr>
				<th>Character</th>
				<th>Code Data Type</th>
			</tr>
		</thead>
		<tbody>
			<tr><td>y</td><td>8-bit unsigned integer</td></tr>
			<tr><td>b</td><td>boolean value</td></tr>
			<tr><td>n</td><td>16-bit signed integer</td></tr>
			<tr><td>q</td><td>16-bit unsigned integer</td></tr>
			<tr><td>i</td><td>32-bit signed integer</td></tr>
			<tr><td>u</td><td>32-bit unsigned integer</td></tr>
			<tr><td>x</td><td>64-bit signed integer</td></tr>
			<tr><td>t</td><td>64-bit unsigned integer</td></tr>
			<tr><td>d</td><td>double-precision floating point (IEEE 754)</td></tr>
			<tr><td>s</td><td>UTF-8 string (no embedded nul characters)</td></tr>
			<tr><td>o</td><td>DBus Object Path string</td></tr>
			<tr><td>g</td><td>DBus Signature string</td></tr>
			<tr><td>a</td><td>Array</td></tr>
			<tr><td>(</td><td>Structure start</td></tr>
			<tr><td>)</td><td>Structure end</td></tr>
			<tr><td>v</td><td>Variant type (described below)</td></tr>
			<tr><td>{'{'}</td><td>Dictionary/Map begin</td></tr>
			<tr><td>{'}'}</td><td>Dictionary/Map end</td></tr>
			<tr><td>h</td><td>Unix file descriptor</td></tr>
		</tbody>
	</table>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
