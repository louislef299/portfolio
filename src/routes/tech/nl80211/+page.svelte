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
		Just copying this over from one of my previous projects. It goes over my experience with
		low-level network programming using Linux network interfaces and Go. Along the way, I was
		having issues battling
		<a href="https://fedoraproject.org/wiki/Tools/NetworkManager">Network Manager</a> when I had
		Fedora Linux installed, so I switched over to Arch and decided to just use
		<a href="https://wiki.archlinux.org/title/Iwd">iwd</a> instead. It has proven to be must
		better in my experience and essentially remains out of the way.
	</p>

	<hr />

	<p>Guess what? Not a whole lot of documentation for nl80211! Yayyyyy :)</p>

	<p>
		Not super surprising after working with netlink being that <strong>it uses the netlink
		protocol</strong>. Anyways, mdlayher has already
		<a href="https://github.com/mdlayher/wifi/tree/main">created an implementation in Go</a>, so
		I should be able to get my footing. Looks like the implementation is only available for Linux,
		so I won't be able to do a whole lot today(possible open source contribution opportunity).
	</p>

	<p>
		Will I work on this before I try to install Arch on my laptop? I don't know, but I feel like
		the Fedora OS is just draining my yoga x86.
	</p>

	<h2>Digging Deeper</h2>

	<p>
		nl80211 is the userspace interface for the configuration API
		<a href="https://www.kernel.org/doc/html/v4.12/driver-api/80211/cfg80211.html">cfg80211</a>.
		This was made to replace the deprecated
		<a href="https://hewlettpackard.github.io/wireless-tools/Linux.Wireless.Extensions.html">Wireless Extensions</a>.
	</p>

	<h2>Reimage usb on Linux with Arch ISO</h2>

	<h3>Reformat the usb</h3>

	<ol>
		<li>find the usb drive with <code>sudo df -Ti</code></li>
		<li>unmount usb to prep for reformat with(ex mount @ /dev/sda1) <code>sudo umount /dev/sda1</code></li>
		<li>reformat to FAT32 filesystem: <code>sudo mkfs.vfat /dev/sdb1</code></li>
		<li>verify usb formatting: <code>sudo fsck /dev/sdb1</code></li>
	</ol>

	<p>
		<em>Side Note</em>: Reasons why FAT32 is a good choice; here are the filesystem comparisons:
	</p>

	<table>
		<thead>
			<tr>
				<th>File System</th>
				<th>Supported File Size</th>
				<th>Compatibility</th>
				<th>Ideal Usage</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>FAT32</td>
				<td>up to 4 GB</td>
				<td>Windows, Mac, Linux</td>
				<td>For maximum compatibility</td>
			</tr>
			<tr>
				<td>NTFS</td>
				<td>16 EiB – 1 KB</td>
				<td>Windows, Mac (read-only), most Linux distributions</td>
				<td>For internal drives and Windows system files</td>
			</tr>
			<tr>
				<td>exFAT</td>
				<td>16 EiB – 1 KB</td>
				<td>Windows, Mac, Linux (requires extra drivers to access)</td>
				<td>For files larger than 4 GB</td>
			</tr>
		</tbody>
	</table>

	<h2>Download Arch ISO</h2>

	<p>Just ran:
		<code>wget -v https://mirrors.umd.edu/archlinux/iso/2024.04.01/archlinux-2024.04.01-x86_64.iso</code>
	</p>

	<p>Then get the gpg file:
		<code>wget -v https://mirrors.umd.edu/archlinux/iso/2024.04.01/archlinux-2024.04.01-x86_64.iso.sig</code>
	</p>

	<p>Validate the package signature with gpg by running after both are downloaded:
		<code>gpg --keyserver-options auto-key-retrieve --verify archlinux-2024.04.01-x86_64.iso.sig</code>
	</p>

	<p>Should return something like:</p>

	<pre><code>gpg: assuming signed data in 'archlinux-2024.04.01-x86_64.iso'
gpg: Signature made Mon 01 Apr 2024 01:00:16 PM CDT
gpg:                using EDDSA key 3E80CA1A8B89F69CBA57D98A76A5EF9054449A5C
gpg:                issuer "pierre@archlinux.org"
gpg: Good signature from "Pierre Schmitz &lt;pierre@archlinux.org&gt;" [unknown]
gpg:                 aka "Pierre Schmitz &lt;pierre@archlinux.de&gt;" [unknown]
gpg: WARNING: The key's User ID is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 3E80 CA1A 8B89 F69C BA57  D98A 76A5 EF90 5444 9A5C</code></pre>

	<p>Once validated, copied the iso over to my mounted drive with the following:</p>

	<pre><code>dd bs=4M if=/home/louislefebvre/Downloads/wget-arch/archlinux-2024.04.01-x86_64.iso \
of=/dev/disk/by-id/usb-SanDisk_Ultra_4C531001380617112524-0:0 \
conv=fsync oflag=direct status=progres</code></pre>

	<h2>Arch finally installed</h2>

	<p>
		After about a month or so of messing around with the Arch install and figuring out how to
		install all the necessary components, I have finally, successfully installed Arch Linux whoop
		whoop. So, after all of those learnings and take-aways, I feel that I am in a spot where I can
		pick this back up.
	</p>

	<p>
		Understanding what drivers are and what driver I would needto install for the wireless adapter
		is pretty simple now. Maybe I would pick that up if I'm going to be messing around with that
		racekit stuff. Anyways, maybe I should document all the changes I made to get Arch setup? The
		hardest part was getting LVM setup with GRUB. I also got hung up on the GUI and initially
		tried out LXDE but then switched to GNOME. LXDE was just so gross to look at and it used XORG
		instead of the improved display server Wayland.
	</p>

	<p>
		Anyways, it feels like I have the exact same laptop I had with Fedora OS, I just understand my
		OS much better with Arch. Nothing lost, only gained(except for the 4k Alaskan surfing photo).
	</p>

	<h2>Additional Resources</h2>

	<ul>
		<li><a href="https://medium.com/@mdlayher/linux-netlink-and-go-part-3-packages-netlink-genetlink-and-wifi-b0ca78e62f8a">mdlayher medium article</a></li>
		<li><a href="https://github.com/mdlayher/wifi/tree/main">mdlayher wifi pkg</a></li>
		<li><a href="https://alamot.github.io/nl80211/">nl80211 implementation in C</a></li>
		<li><a href="https://www.infradead.org/~tgr/libnl/">netlink protocol summary</a></li>
		<li><a href="https://wiki.archlinux.org/title/Installation_guide">arch install guide</a></li>
		<li><a href="https://phoenixnap.com/kb/linux-format-usb">format usb linux</a></li>
		<li><a href="https://archlinux.org/download/">arch download locations</a></li>
	</ul>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
