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
		Alright, recently my friends and I wanted to start up a new Minecraft world, and I got challened
		to host my own server. It wound up being super easy and I'm just going to go over how I
		configured the server and any other notes here.
	</p>

	<h2>About the Setup</h2>

	<p>
		To allow all of my friends to access the local server, I gave them access to my
		<a href="https://tailscale.com/kb/1136/tailnet">tailnet</a>. It works super slick for now, but
		I had to upgrade to the
		<a href="https://tailscale.com/pricing?plan=personal">personal plus plan</a> and fork over the
		extra $6 for this first month. Long-term, I'm going to setup an OpenVPN on my network so that I
		can get around this and surpass my 6 user limit.
	</p>

	<p>
		It will be pretty hard to ditch the tailnet, however, because it was stupid simple to setup and
		it's way less demanding as opposed to a VPN by only routing the necessary traffic over the
		tailnet. Getting my non-techy friends and technically-saavy friends to onboard to the tailnet
		was nice and easy by either emailing them a link or sending them an onboarding link. Then after
		adding my account, they were a part of my network!
	</p>

	<p>
		After they successfully joined the tailnet, they just had to server name using my custom DNS
		domain and they were in.
	</p>

	<h2>Setting up the Minecraft Server</h2>

	<p>
		Luckily, there was a great doc in the
		<a href="https://wiki.archlinux.org/title/Minecraft/Java_Edition_server">Arch Wiki on Minecraft</a>
		that I could follow to configure the server. It was a pretty easy setup of configuring the
		<code>minecraft</code> user and group and then starting the service with systemd.
	</p>

	<h3>Permissions</h3>

	<h4>Creating the <code>minecraft</code> user and group</h4>

	<p>
		Pretty simple to create the
		<a href="https://wiki.archlinux.org/title/Users_and_groups">user and group</a>, and just called
		them both <code>minecraft</code>. Here are the steps:
	</p>

	<pre><code># Create minecraft group
sudo groupadd minecraft

# Create minecraft user, assign it to the minecraft group, and create a home directory
sudo useradd -m -g minecraft minecraft</code></pre>

	<p>
		Since I am running the Minecraft server with systemd, I just validated that the Minecraft
		service was running with the correct user and group(located at
		<code>/lib/systemd/system/minecraftd.service</code>):
	</p>

	<pre><code>[Service]
Type=forking
ExecStart=/usr/bin/minecraftd start
ExecStop=/usr/bin/minecraftd stop
User=minecraft
Group=minecraft</code></pre>

	<h4>Set permissions for the Minecraft directory</h4>

	<p>
		In order to ensure that the <code>minecraft</code> user has the appropriate permissions to
		access and modify files in the <code>/srv/minecraft</code> directory, I made sure to provided
		the user and group ownership:
	</p>

	<pre><code># Change ownership of the /srv/minecraft directory to the minecraft user and group
sudo chown -R minecraft:minecraft /srv/minecraft

# Set the appropriate permissions
sudo chmod -R 755 /srv/minecraft</code></pre>

	<h4>Add my user to the <code>minecraft</code> group</h4>

	<p>
		Finally, to make sure I had all the necessary permissions to the directory, I made sure to add
		myself to the group as well:
	</p>

	<pre><code># Add an existing user to the minecraft group
sudo usermod -aG minecraft louis</code></pre>

	<h3>Running the Server</h3>

	<p>
		First, needed to accept the EULA by modifying <code>/srv/minecraft/eula.txt</code>. We also
		wanted a solid spawn point, so I configured <code>level-seed</code> of the
		<code>server.properties</code> file to have the
		<a href="https://www.rockpapershotgun.com/best-minecraft-seeds-java-survival-seeds">cherry blossom value</a>(-5584399987456711267).
		Then, just a super simple <code>systemctl start minecraftd</code> was needed. I also made sure
		to <code>enable</code> the service so that is runs on reboot.
	</p>

	<h2>Monitoring</h2>

	<p>
		Since there are people that rely on this server now and I want to make sure they know when the
		server is healthy and when it isn't, I was thinking I could monitor the server with Prometheus
		from my RaspberryPi. It would be a pretty simple setup of running a node-exporter for general
		server information, the
		<a href="https://github.com/sladkoff/minecraft-prometheus-exporter">JVM and more system-specific minecraft-prometheus-exporter</a>
		and maybe even the more
		<a href="https://github.com/dirien/minecraft-prometheus-exporter">gameplay-specific minecraft-prometheus-exporter</a>.
	</p>

	<p>
		I'll have to make a post about that later, I haven't had time to finish configuring that
		monitoring, but would be simple to first get it monitoring and then later to get alerting setup
		to the minecraft slack channel.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
