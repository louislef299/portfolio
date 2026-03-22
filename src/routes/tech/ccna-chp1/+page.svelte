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
		Chapter 1 starts off with getting some initial perspectives on networking down as a general
		introduction. This was all really review as they just talked about the different ways and
		individual or enterprise connect to a network and through which mediums.
	</p>

	<p>
		After an initial network introduction, the reading went into the TCP/IP networking model and
		the history of the initial battle between the OSI model and TCP/IP. The important historical
		value to note is that in the late 1970s and early 1980s, the OSI model looked to be the model
		that would win out. That is why you see lots of documentation still reference "Layer 7"
		protocols even though the TCP/IP model won out and only technically has 5 layers.
	</p>

	<p>Here is a useful diagram of both models and the protocols they implement:</p>

	<img src="/image/tech/ccna-chp1/tcp-ip-network-model.jpg" alt="TCP/IP Networking Model" loading="lazy" />

	<p>
		The TCP/IP model references protocols that are used to allow and dictate communication between
		computers. Protocol definitions are defined as
		<a href="https://www.ietf.org/standards/rfcs/">RFCs</a>. Each layer in the TCP/IP stack serves
		the layer above it and utilizes the layer below.
	</p>

	<p>
		Adjacent-layer communication and same-layer communication are two important concepts when
		thinking about the TCP/IP model(verbatim from the book):
	</p>

	<table>
		<thead>
			<tr>
				<th>Concept</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Same-layer interation on different computers</td>
				<td>The two computers use a protocol to communicate with the same layer on another computer. The protocol defines a header that communicates what each computer wants to do.</td>
			</tr>
			<tr>
				<td>Adjacent-layer interation on the same computer</td>
				<td>On a single computer, one lower layer provides a service to the layer just above. The software or hardware that implements the higher layer requests that the next lower later perform the needed function.</td>
			</tr>
		</tbody>
	</table>

	<h2>Application Layer(L7-L5)</h2>

	<p>
		The application layer defines services that the applications need, acting as an interface
		between the actual application software and the network. For example, HTTP defines how web
		browsers can pull the contents of a web page from a web server.
	</p>

	<h2>Transport Layer(L4) [Segment]</h2>

	<p>
		The transport layer serves the application layer by providing two popular protocols:
		<a href="https://meghagarwal.medium.com/tcp-vs-udp-c3dedd91f66d">TCP and UDP</a>.
	</p>

	<h3>TCP(Transmission Control Protocol)</h3>

	<p>
		To explain the basics of the benefits the transport layer serves to the application layer,
		there is a lot of information around the TCP protocol. It is easier to understand the
		separation of concerns through TCP because of its error-checking, guaranteed delivery, and
		order preservation.
	</p>

	<h2>Network Layer(L3) [Packet]</h2>

	<p>
		This section just basically revolves around the Internet Protocol(IP). There is a pretty
		abstract postage example, but since I already kinda understand how this works, we are going to
		skip it. The main idea is that the IP header will include a destination and source IP address
		that is used when routing the packet.
	</p>

	<p>Most of this book revolves around the IP protocol, so more information to come!</p>

	<h2>Data-Link and Physical Layers(L2-L1) [Frame]</h2>

	<p>
		This layer defines the protocols <em>and</em> hardware required to actually deliver data
		across some physical network. They are usually combined since the physical layer is just the
		hardware required to transmit the data, which the data-link layer is actually encapsulating
		headers onto the frame. Data-link will typically encapsulate a header and trailer onto the
		frame:
	</p>

	<pre><code>  LH = Link-Header
  LT = Link-Trailer

  +----+-----------+----+
  | LH | IP Packet | LT |
  +----+-----------+----+</code></pre>

	<h2>Additional Notes</h2>

	<p>
		Important to not only understand encapsulation but also de-encapsulation. Just the reverse of
		the TCP/IP stack when a device receives content.
	</p>

	<p>
		Also, a protocol data unit(PDU) represents the bits that include the headers and trailers for
		that layer, as well as the encapsulated data. It is an OSI term that is important to know and
		references each layer PDU as LxPDU("x" being the layer number in this case).
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
