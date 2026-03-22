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
		Just messing around with network interfaces in an attempt to understand some of the low-level OS
		fundamentals. I was led in this direction when looking at Wireguard's packages and getting a
		fun, system-level example of how to run system calls and file descriptors to configure network
		interfaces in Go.
	</p>

	<h2>Wireguard's TUN interface</h2>

	<p>
		Referenced code can be found in the
		<a
			href="https://github.com/louislef299/go-scripts/blob/main/projects/network-interfaces/main.go"
			>TUN project</a
		>.
	</p>

	<h3>Setting Up</h3>

	<p>
		The TUN interface is created at <code>/dev/net/tun</code> and represents the tunnel used to
		communicate with the external service. When running through Cloudflare's
		<a href="https://blog.cloudflare.com/virtual-networking-101-understanding-tap/"
			>Understanding TUN/TAP</a
		>, it made more sense that this TUN device represented a local point-to-point connection with
		the Wireguard service. Found this fun rhyme to remember the difference between the device types:
	</p>

	<blockquote>
		<p>
			Tap is like a switch,<br />
			Ethernet headers it'll hitch.<br />
			Tun is like a tunnel,<br />
			VPN connections it'll funnel.<br />
			Ethernet headers it won't hold,<br />
			Tap uses, tun does not, we're told.
		</p>
	</blockquote>

	<p>
		To see Wireguard create the TUN interface, a lot of the code in <code>FirstExample()</code> is
		pulled directly from the
		<a href="https://github.com/tailscale/wireguard-go">Wireguard Mirror</a>'s
		<code>main.go</code> function. See the example with the following:
	</p>

	<pre><code># In one terminal, run FirstExampe() to create the TUN interface:
sudo go run main.go

# Then in another terminal, view the TUN interface using iproute2:
# (Should output louis0: tun vnet_hdr)
ip tuntap list
ip -s link show dev louis0</code></pre>

	<p>When the device is being setup, Wireguard goes through the following stages:</p>

	<ol>
		<li>Open <code>/dev/net/tun</code> to request new interface device</li>
		<li>
			Generate a new device request through <code>ioctl()</code>(OS dependent) with flags
		</li>
		<li>Send <code>ioctl()</code> device request</li>
		<li>Set file descriptor to non-blocking</li>
		<li>Create a new file from fd to <code>/dev/net/tun</code>??</li>
		<li>
			Create the TUN from the generated file =&gt; the NativeTun is the software interface used to
			interact with the application
		</li>
	</ol>

	<h3>Understanding NativeTun</h3>

	<p>TODO</p>

	<p>
		Will want to understand how Wireguard actually interacts with TUN once created. Will be a bit
		different than the TAP document, but should be able to pull references from there and Tailscale.
	</p>

	<h2>References</h2>

	<ul>
		<li>
			<a href="https://lightyear.ai/blogs/point-to-point-leased-lines-p2p-vs-wavelength-circuits"
				>Point-to-Point topology</a
			>
		</li>
		<li>
			<a href="https://docs.kernel.org/networking/tuntap.html">Linux TUN/TAP Networking</a>
		</li>
		<li>
			<a href="https://github.com/tailscale/wireguard-go">Wireguard Mirror</a>
		</li>
		<li>
			<a href="https://blog.cloudflare.com/virtual-networking-101-understanding-tap/"
				>Understanding TUN/TAP</a
			>
		</li>
		<li>
			<a href="https://copyconstruct.medium.com/nonblocking-i-o-99948ad7c957"
				>File descriptor deep dive</a
			>
		</li>
		<li>
			<a href="https://backreference.org/2010/03/26/tuntap-interface-tutorial/"
				>TUN/TAP Interface Tutorial</a
			>
		</li>
	</ul>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
