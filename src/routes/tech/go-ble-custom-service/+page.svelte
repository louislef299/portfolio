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
		In this article we will be creating a custom Bluetooth Service in Go. I'll be walking through
		the <a href="https://novelbits.io/bluetooth-gatt-services-characteristics/">NovelBits article</a>
		and use the
		<a href="https://pkg.go.dev/tinygo.org/x/bluetooth">tinygo pkg</a>. The requirements I have for
		my current project require a custom Bluetooth Service as none of the pre-defined services from
		<a
			href="https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Assigned_Numbers/out/en/Assigned_Numbers.pdf?v=1735501678042"
			>Bluetooth SIG</a
		> cover my use case.
	</p>

	<h2>About Services</h2>

	<p>
		In the past, I had
		<a href="/tech/simple-bluetooth/">gone over bluetooth services and characteristics</a>, so I
		understand services from a high level, but good to go over it quickly.
	</p>

	<p>
		Services are conceptual entities that groups together one or more attributes/characteristics.
		Each service is distinguished by a UUID that is either 16-bits in length for officially adopted
		BLE services or 128-bits long for custom services. To avoid confusion, bluetooth profiles are
		simple services that are pre-defined by the Bluetooth SIG community. From
		<a href="https://novelbits.io/bluetooth-gatt-services-characteristics/">NovelBits</a>:
	</p>

	<blockquote>
		A service also contains other attributes (non-characteristics) that help structure the data
		within a service (such as service declarations, characteristic declarations, and others).
	</blockquote>

	<h2>Writing a Custom Service using tinygo</h2>

	<p>
		Creating a custom service is fairly simple and just requires the creation of a custom UUID. Once
		the association has to happen with the bluetooth adapter is when things get interesting.
	</p>

	<p>
		The
		<a href="https://pkg.go.dev/tinygo.org/x/bluetooth#CharacteristicConfig">CharacteristicConfig</a>
		is broken down as follows:
	</p>

	<ul>
		<li>
			<strong>Handle</strong>: A reference to the characteristic, which can be used to identify
			the characteristic in the service.
		</li>
		<li>
			<strong>UUID</strong>: The unique identifier for the characteristic. It's typically a 16-bit
			or 128-bit UUID that identifies the type of data the characteristic will hold.
		</li>
		<li>
			<strong>Value</strong>: The initial value of the characteristic, often provided as a byte
			slice ([]byte).
		</li>
		<li>
			<strong>Flags</strong>: Flags that define the permissions of the characteristic. These
			specify which operations are allowed, such as reading, writing, and notifying.
		</li>
		<li>
			<strong>WriteEvent</strong>: A callback function that is triggered when data is written to
			the characteristic. It allows you to handle incoming data and take action based on the
			received value.
		</li>
	</ul>

	<p>Here is an implementation example:</p>

	<pre><code class="language-go">var currentTime = time.Now()

// addCustomService defines and adds a custom Bluetooth service to a BLE
// adapter.
func addCustomService(adapter *bluetooth.Adapter, characteristic *bluetooth.Characteristic) error {'{'}
    // create custom uuids(partially redacted)
    characteristicUUID := bluetooth.NewUUID()
    serviceUUID := bluetooth.NewUUID()

    // enable interaction with this time-based characteristic by adding the
    // service to the adapter
    return adapter.AddService(&amp;bluetooth.Service{'{'}
        UUID: serviceUUID,
        Characteristics: []bluetooth.CharacteristicConfig{'{'}{'{'}
            Handle: characteristic,
            UUID:   characteristicUUID,
            // add default value to characteristic
            Value:  []byte(currentTime.Format(time.RFC3339)),
            // grant read, write, and write-without-response permissions
            Flags:  bluetooth.CharacteristicReadPermission | bluetooth.CharacteristicWritePermission | bluetooth.CharacteristicWriteWithoutResponsePermission,
            // when a write request is made to the characteristic, it attempts
            // to parse the received time string and, if the new time is later
            // than the current time, updates the currentTime variable with the
            // new value
            WriteEvent: func(client bluetooth.Connection, offset int, value []byte) {'{'}
                t, err := time.Parse(time.RFC3339, string(value))
                if err != nil {'{'}
                    log.Println("couldn't parse time:", err)
                    return
                {'}'}
                if t.After(currentTime) {'{'}
                    log.Printf("changing the current time to %s\n", t.Format(time.RFC3339))
                    currentTime = t
                {'}'}
            {'}'}{'}'},
        {'}'},
    {'}'})
{'}'}</code></pre>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
