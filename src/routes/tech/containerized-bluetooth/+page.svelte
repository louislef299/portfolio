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
		Today, I am going to attempt to
		<a
			href="https://medium.com/omi-uulm/how-to-run-containerized-bluetooth-applications-with-bluez-dced9ab767f6"
			>containerize a bluetooth application</a
		>
		using Docker. I've been
		<a href="/tech/simple-bluetooth/">learning about the bluetooth protocol using Go</a> and simply
		copy the Go Central code to my raspberry pi and run it with Go and Bluez. It works, but it's
		not easy to transport since it typically requires the hard-coding of the wifi network into the pi
		image. Since I travel around a lot, this should be more flexible and allow me to publish the
		container so I can pull it down from any machine(that runs a container runtime).
	</p>

	<h2>Reading through the article</h2>

	<p>
		An initial note: the author linked a Microsoft article about Cloud Native applications and..
		that was a bit unnerving.
	</p>

	<p>
		Basically, this article is a great reference point to understanding
		<a href="https://www.bluez.org/">Bluez</a>. It was honestly an interesting approach to sharing a
		single bluetooth adapter with mutliple containers on a single node. The idea is there is one
		bluetooth service that runs on the node that communicates with other services over a REST API.
		Cool architecture, but not really what I directly need.
	</p>

	<p>
		The recommended approach to actually running everything locally is to have multiple adapters so,
		let's take a look at my system and see if I can get around interacting with the D-Bus.
	</p>

	<h2>Understanding Device Specifications</h2>

	<p>My current kernal release is:</p>

	<pre><code>[louis@louarch1]$ uname -r
6.12.6-arch1-1</code></pre>

	<p>
		With the <code>bluetoothctl list</code> and <code>bluetoothctl show</code> commands, I was able
		to learn that I only have one bluetooth adapter on my device but, it supports both the central
		and peripheral roles.
	</p>

	<p>
		To write bluetooth code in Go on the same device that acts as a central and peripheral, I can
		use the
		<a
			href="https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/doc/org.bluez.Device.rst"
			>D-Bus API exposed by BlueZ</a
		>. BlueZ provides D-Bus interfaces for interacting with Bluetooth devices, managing connections,
		and handling GATT services for both the central and peripheral roles. Seems a little complex for
		something so simple.
	</p>

	<h2>Stepping back a bit</h2>

	<p>
		Alright if I'm working directly with the D-Bus to interact with BlueZ, I think the solution may
		be more complex than it needs to be. Decided to step back a bit a just use the old solution I
		had. Just a combination of <a href="https://tailscale.com/kb/1151/what-is-tailscale">tailscale</a>
		hosts on my local network that can interact with the pi zeros over bluetooth and ssh. That way,
		as long as the tailnet is up and running, I should always have access to the raspberry pis.
	</p>

	<pre><code>+--------------------+
|   Local Computer   |
|  +---------------+ |
|  |   SSH Client  | |
|  +---------------+ |
+--------------------+
         |
         | Tailnet
         |
+--------------------+
|   Tailscale Host   |
|    (Jump Host)     |
|  +---------------+ |
|  |   SSH Client  |&lt;--------------+
|  +---------------+ |             |
+--------------------+ Bluetooth   |
                                   |
+------------------------+         |
| Raspberry Pi Zero 1    |&lt;--------+
|(Bluetooth, SSH, BlueZ) |         |
+------------------------+         |
                                   |
+------------------------+         |
| Raspberry Pi Zero 2    |&lt;--------+
|(Bluetooth, SSH, BlueZ) |         |
+------------------------+         |
                                   |
+------------------------+         |
| Raspberry Pi Zero 3    |&lt;--------+
|(Bluetooth, SSH, BlueZ) |
+------------------------+</code></pre>

	<p>
		It brought up a good excuse to reformat that new laptop I got my hands on. My current main node
		in my home lab isn't super reliable, but if I made that new laptop the main node, it could be
		more reliable, I would have access to a direct interface if things start going wrong instead of
		having to HDMI into the TV and crack out the keyboard and mouse.
	</p>

	<h2>Conclusion</h2>

	<p>
		Well, funny to come around to the same conclusion I had had before this experiment. Luckily I
		learned some information about BlueZ and bluetooth in general. If I had more time and more of a
		care, I would definitely look further into the D-Bus API solution, but for now I'll leave it for
		another time.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
