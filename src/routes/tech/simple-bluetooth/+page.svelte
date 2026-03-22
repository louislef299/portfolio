<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p>
	Just going to go over communicating over bluetooth in Go. Over the summer, I had
	spent some time learning the <a href="https://learn.adafruit.com/introduction-to-bluetooth-low-energy/gap">basics of bluetooth</a>
	and made a super simple central and peripheral example in Go. Summarizing those learnings here.
</p>

<p>
	Definitely go over the above link to help understand the rest of this quick
	summary. I seem to frequently mess with bluetooth a bit and then don't touch it
	for an extended period of time, so this is mostly a reference document for me to
	get a quick refresher on the basics until I spend significant time at the
	embedded level. Honestly, I spend way more time at the infrastructure and server
	level, so that comes more naturally to me.
</p>

<h3>Notes on GATT</h3>

<p>
	GAP is covered first, but mostly just goes over the advertisement protocol for
	bluetooth. Here is a Go snippet that summarizes the basics of GAP:
</p>

<pre><code>// Define the peripheral device info.
adv := adapter.DefaultAdvertisement()
err = adv.Configure(bluetooth.AdvertisementOptions{'{'}
    LocalName: "loupi5",
    Interval:  bluetooth.Duration(20000),
{'}'})
if err != nil {'{'}
    log.Fatal(err)
{'}'}</code></pre>

<p>
	The <strong>Generic ATTribute(GATT)</strong> Profile defines how BLE devices transfer data
	back and forth using concepts called Services and Characteristics. GATT is
	important to consider when a connection is established between two devices that
	have already gone through the advertising process governed by GAP.
</p>

<p>
	Only one peripheral device can be connected to a central at a time using GATT,
	meaning that any advertising that had happened prior to GATT will not continue.
	This connection then allows for two-way communication between devices.
</p>

<p>
	GATT Servers(Peripherals) and Clients(Centrals) negotiate a connection interval
	to transact data. This interval is just a recommendation, however, not a
	requirement. The GATT transactions contain nested objects called
	<a href="https://www.bluetooth.com/specifications/specs/">Profiles</a>,
	<a href="https://www.bluetooth.com/specifications/assigned-numbers/">Services and Characteristics</a>.
</p>

<img src="/image/tech/simple-bluetooth/microcontrollers_GattStructure.png" alt="Profiles, Services, and Chars" loading="lazy" />

<h2>Going over my simple example</h2>

<p>
	The central peripheral code can be found in my <a href="https://github.com/louislef299/ble-playground">ble-playground</a> repository.
	It's pretty simple and doesn't do anything special, so I'll skip an in-depth
	description and instead give this high-level diagram of what it does:
</p>

<pre><code>+-----------------+            +----------------------+
|                 |            | Scan for device with |
|  PiZero loupi5  +----------&gt;| name loupi5. Once    |
|                 |            | found: connect,      |
|                 +----------&gt;| discover services,   |
|    advertise..  |            | and then disconnect  |
|                 &lt;------------+                      |
|                 |            |   (Central)          |
|   (Peripheral)  |            +----------------------+
+-----------------+</code></pre>

<p>
	The PiZero in this case was on my local network and I had it advertise bluetooth
	using <a href="https://www.bluez.org/">bluez</a> and uploaded the Go binary with <code>scp</code>.
</p>

<h2>Where do I want to Go?</h2>

<p>
	In a separate post, I would like to have a cylic TCP=&gt;Bluetooth=&gt;TCP
	relationship between my computer and the pi5. It helps understand how to allow
	the peripheral node to act as a sort of gateway to the central(where I need to
	understand this architecture and how this ble interest started).
</p>
