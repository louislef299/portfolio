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
		So, it's finally time to shine off my
		<a href="https://github.com/louislef299/aws-sso">aws-sso</a> custom cli tool. Initially, it
		was written to only be developed for myself, and I had mostly just been maintaining
		dependencies and not actually developing any new features. The last release I had actually
		developed a feature on was
		<a href="https://github.com/louislef299/aws-sso/releases/tag/v1.4.0">v1.4.0</a>, which was
		mostly about persisting information about different accounts so that I wouldn't have to pass
		flags every time I ran a command.
	</p>

	<p>
		For those of you who don't want to read a shitty README and aren't able to get a personal 1:1
		video with me, the skinny of the tool is that I disliked the way AWS had setup their
		<code>aws sso login</code> as I thought it was not intuitive and led to people re-authing and sort
		of fumbling around with it. Not only was that piece annoying, it wouldn't automatically
		authenticate you to ECR or EKS, which I was constantly doing as a young kubernetes administrator
		across many environments, so I wrote a tool that worked in a more idiomatic way and automated
		the container registry and cluster authentication as well.
	</p>

	<p>
		Well for one of my first cli tools that I wrote only 1 year into my professional career, it
		wasn't bad! Looking back on some of the programming choices I made, it isn't as modular as I
		would prefer, but it generally works. Every once in a while I need to pass a
		<code>--refresh</code> flag, but otherwise it works fine.
	</p>

	<p>
		My problems started when I was forced to update my GoReleaser configuration a
		<a href="https://github.com/louislef299/aws-sso/pull/480">start publishing my brew config as a Cask</a>.
	</p>

	<h2>Apple Gatekeeper</h2>

	<p>
		With the switch to Casks, artifacts need to be notarized. This essentially left me with two
		options:
	</p>

	<ul>
		<li>Spend $99 a year on an <a href="https://developer.apple.com/">Apple Developer Account</a></li>
		<li>Hack my way through the problem</li>
	</ul>

	<p>
		Since I don't yet <em>love</em> the idea of giving Apple even more money just to run software
		on their system, I decided to go the route of hacking my way through with a post-install
		script:
	</p>

	<pre><code>homebrew_casks:
  - name: aws-sso
    hooks:
      post:
        install: |
          if system_command("/usr/bin/xattr", args: ["-h"]).exit_status == 0
            system_command "/usr/bin/xattr", args: ["-dr", "com.apple.quarantine", "#{'{'}staged_path{'}'}/aws-sso"]
          end</code></pre>

	<p>
		Although it was annoying to deal with, it's nice to know that this runtime protection exists.
		And it got me thinking that even if I don't want to pay Apple $99/year, I should do my end
		users justice and notarize my binary so that they have an increased amout of trust installing
		and using my software that interacts with such sensitive information.
	</p>

	<h2>GnuPG(GNU Privacy Guard)</h2>

	<p>
		<a href="https://www.gnupg.org/gph/en/manual/book1.html">GnuPG</a> is a free implementation
		of <a href="https://www.openpgp.org/about/">OpenPGP</a>. From
		<a href="https://www.ietf.org/rfc/rfc4880.txt">RFC4880</a>:
	</p>

	<blockquote>
		<p>
			OpenPGP software uses a combination of strong public-key and symmetric cryptography to
			provide security services for electronic communications and data storage.
		</p>
	</blockquote>

	<p>
		So essentially, perfect for my scenario. For information of how to generate a key-pair, I'd
		recommend running through the
		<a href="https://wiki.archlinux.org/title/GnuPG#Create_a_key_pair">Arch Wiki docs</a>. But,
		after running through that process, I was able to get my public key uploaded at
		<a href="/public-key.txt">louislefebvre.net/public-key.txt</a>.
	</p>

	<h3 id="quickstart-gpg">Quickstart GPG</h3>

	<p>
		This section will just go over some useful GPG tips so that I can reference this later. It
		specifically signs a <code>doc</code> with a
		<a href="https://www.gnupg.org/gph/en/manual/r622.html">detached signature</a> because I am
		mostly using GPG to sign and distribute software.
	</p>

	<pre><code># Generate a new key
gpg --full-generate-key

# Generate a key with defaults
gpg --gen-key

# List keys on your public key ring
gpg --list-keys --keyid-format=long

# Export a public key to stdout(--output to write to file)
gpg --armor --export &lt;keyID/userID&gt;

# Check key expiration date
gpg -k &lt;keyID&gt;

# Detached signature on a doc with a specific key(--default-key)
gpg --default-key &lt;keyID&gt; --detach-sig --output doc.sig --sign doc

# Verify the signature
gpg --verify doc.sig doc

# Master Key + Subkeys Strategy
## After generating, create separate subkeys for different operations:
## Edit your key to add subkeys
gpg --expert --edit-key your-email@example.com</code></pre>

	<h2>Signing a Binary</h2>

	<p>
		Signing <code>aws-sso</code> is as simple as building the binary:
	</p>

	<pre><code>git clone https://github.com/louislef299/aws-sso.git &amp;&amp; \
cd aws-sso &amp;&amp; make</code></pre>

	<p>
		and signing that binary with the key ID(gathered with <code>gpg --list-keys</code>):
	</p>

	<pre><code>gpg --default-key &lt;key-id&gt; --detach-sig --output aws-sso.sig --sign aws-sso</code></pre>

	<p>and verify the signature:</p>

	<pre><code>$ gpg --verify aws-sso.sig aws-sso
gpg: Signature made Thu June 26 22:34:44 2025 CDT
gpg:                using EDDSA key &lt;key-id&gt;
gpg: Good signature from "Louis LeFebvre (Signing key generated 06/26/2025) &lt;louis@gmail.com&gt;" [ultimate]</code></pre>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
