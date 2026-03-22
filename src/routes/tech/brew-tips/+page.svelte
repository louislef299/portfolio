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
	<h2>How To Brew</h2>

	<p>
		<a href="https://brew.sh/">Homebrew</a> is an excellent package manager for macOS and even
		<a href="https://docs.brew.sh/Homebrew-on-Linux">Linux</a> that I use daily, so I'm going to
		take a deep-dive today and give a high-level overview of Homebrew from the perspective of a
		sysadmin. I've worked with a lot of engineers who understand <code>brew install</code> and maybe
		even <code>brew upgrade</code>, but not much past that. This post covers day-to-day usage and
		how to <code>brew</code> responsibly.
	</p>

	<p>
		Regularly, I run <code>brew update &amp;&amp; brew upgrade &amp;&amp; brew cleanup</code> so my
		tools stay current and my disk doesn't fill up with stale artifacts.
	</p>

	<p>
		Another important command to run regularly is <code>brew doctor</code> to catch stale symlinks,
		PATH issues, and other gotchas. Good to note: <em>Warnings</em> can safely be ignored from the
		output. For example, the following warns me that some packages are disabled, so I should figure
		out where the new remote location is, but <code>brew</code> itself is functioning fine:
	</p>

	<pre><code>$ brew doctor
Please note that these warnings are just used to help the Homebrew maintainers
with debugging if you file an issue. If everything you use Homebrew for is
working fine: please don't worry or file an issue; just ignore this. Thanks!

Warning: Some installed casks are deprecated or disabled.
You should find replacements for the following casks:
  powershell

Warning: Some installed formulae are deprecated or disabled.
You should find replacements for the following formulae:
  neofetch
  terraform</code></pre>

	<h2>Casks? Formulae?? Packages???</h2>

	<blockquote>
		<p>
			Formula: Homebrew package definition that builds from upstream sources.
		</p>
		<p>
			Cask: Homebrew package definition that installs pre-compiled binaries built and signed by
			upstream.
		</p>
		<p>
			<em><a href="https://docs.brew.sh/Manpage">Brew Man Page</a></em>
		</p>
	</blockquote>

	<p>
		This is why I still just call all the targets <code>brew</code> manages <em>packages</em> since
		it covers both <em>Casks</em> &amp; <em>Formulae</em>. Homebrew uses Git for storing formula
		&amp; cask definitions. It installs <em>formula</em> packages to the <em>Cellar</em> (<code
			>brew --cellar</code
		>), which is a local filesystem directory for installed software. It then symlinks them into the
		<em>prefix</em> (<code>brew --prefix</code>). On the other hand, <em>Casks</em> are stored in
		the <em>Caskroom</em> and linked or placed into appropriate locations depending on the artifact
		type (e.g. <code>/Applications</code>).
	</p>

	<pre><code># Example info for a Formula(go)
$ brew info go
==&gt; go ✔: stable 1.26.0 (bottled), HEAD
Open source programming language to build simple/reliable/efficient software
https://go.dev/
Installed
/opt/homebrew/Cellar/go/1.26.0 (14,925 files, 228.4MB) *
  Poured from bottle using the formulae.brew.sh API on 2026-02-13 at 10:21:30
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/g/go.rb
License: BSD-3-Clause
==&gt; Requirements
Required: macOS &gt;= 12 (or Linux) ✔
==&gt; Options
--HEAD
        Install HEAD version
==&gt; Downloading https://formulae.brew.sh/api/formula/go.json
==&gt; Analytics
install: 202,189 (30 days), 444,567 (90 days), 1,406,114 (365 days)
install-on-request: 164,448 (30 days), 352,537 (90 days), 1,098,571 (365 days)
build-error: 833 (30 days)

# Example info for a Cask(aws-sso)
$ brew info aws-sso
==&gt; aws-sso ✔: 1.6.22
https://github.com/louislef299/aws-sso
Installed
/opt/homebrew/Caskroom/aws-sso/1.6.22 (40.2MB)
  Installed on 2025-11-20 at 09:39:22
From: https://github.com/louislef299/homebrew-aws-sso/blob/HEAD/Casks/aws-sso.rb
==&gt; Name
aws-sso
==&gt; Description
Thanks for installing aws-sso! You can get configured by going to
https://aws-sso.netlify.app. The binary you have installed came with a binary
signature if you would like to verify the install. More information can be
found on the website
==&gt; Artifacts
aws-sso (Binary)</code></pre>

	<p>
		This post won't go over how to create <em>Formulae</em> or <em>Casks</em>, but you can
		reference the <a href="https://docs.brew.sh/Formula-Cookbook">Formula Cookbook</a> and
		<a href="https://docs.brew.sh/Cask-Cookbook">Cask Cookbook</a> to get started. It is important
		to mention that these Formula/Cask definitions are just Ruby scripts hosted by a <em>Tap</em>.
		If you'd like to view what these definitions look like, you can run <code>brew cat go</code> to
		view the <code>go</code> Formula and <code>brew cat --cask aws-sso</code> to view the
		<code>aws-sso</code> Cask.
	</p>

	<p>
		While fully understanding these scripts isn't required if you are just a client of
		<code>brew</code>, there are some parts that you should understand to improve your security
		posture. We'll cover this later in the Security section, but first, let's cover the relationship
		between <em>Taps</em> &amp; Git.
	</p>

	<h2>What's A Tap?</h2>

	<blockquote>
		<p>
			tap: Directory (and usually Git repository) of formulae, casks and/or external commands. By
			default, taps are repositories that are assumed to come from GitHub, but isn't limited to any
			one location.
		</p>
		<p>
			<em><a href="https://docs.brew.sh/Manpage">Brew Man Page</a></em>
		</p>
	</blockquote>

	<p>
		So, a tap is a location(remote or local) that contains the required <em>Formula</em> or
		<em>Cask</em>. The default <em>Tap</em> that <code>brew</code> uses is
		<a href="https://github.com/Homebrew/homebrew-core"><code>homebrew/core</code></a> and any
		additional <em>Taps</em> must be integrated with <code>brew tap</code>. It's important to note
		here you should only <code>tap</code> trusted vendors since tapping gives the repo maintainers
		the ability to deliver code to your machine.
	</p>

	<p>
		To fully understand tapping, I think it's best to demo an example for <code>aws-sso</code>:
	</p>

	<pre><code># First, notice that brew can't find aws-sso by
# default since it's not in homebrew/core
$ brew search aws-sso
==&gt; Formulae
aws-sso-cli     aws-sso-util

# So, let's tap my repository that hosts my aws-sso Cask
$ brew tap louislef299/aws-sso
==&gt; Tapping louislef299/aws-sso
Cloning into '/opt/homebrew/Library/Taps/louislef299/homebrew-aws-sso'...
remote: Enumerating objects: 311, done.
remote: Counting objects: 100% (159/159), done.
remote: Compressing objects: 100% (122/122), done.
remote: Total 311 (delta 63), reused 3 (delta 1), pack-reused 152 (from 2)
Receiving objects: 100% (311/311), 51.66 KiB | 10.33 MiB/s, done.
Resolving deltas: 100% (158/158), done.
Tapped 1 cask (15 files, 70.3KB).

# Now, aws-sso is discoverable and can be installed
$ brew search aws-sso
==&gt; Formulae
aws-sso-cli     aws-sso-util

==&gt; Casks
louislef299/aws-sso/aws-sso

$ brew install aws-sso
==&gt; Fetching downloads for: louislef299/aws-sso/aws-sso
✔︎ Cask aws-sso (1.6.22)     Verified     12.9MB/ 12.9MB
==&gt; Installing Cask aws-sso
==&gt; Linking Binary 'aws-sso' to '/opt/homebrew/bin/aws-sso'
🍺  aws-sso was successfully installed!

# Optionally untap repositories you no longer want
# (need to uninstall related packages first)
$ brew uninstall aws-sso &amp;&amp; brew untap louislef299/aws-sso
==&gt; Uninstalling Cask aws-sso
==&gt; Unlinking Binary '/opt/homebrew/bin/aws-sso'
==&gt; Purging files for version 1.6.22 of Cask aws-sso
Untapping louislef299/aws-sso...
Untapped 1 cask (15 files, 70.3KB).</code></pre>

	<h2>Security Best Practices</h2>

	<p>
		Homebrew, and frankly all package managers, install arbitrary code from the internet. But unlike
		most package managers, Homebrew
		<a href="https://docs.brew.sh/FAQ#why-does-homebrew-say-sudo-is-bad">refuses to run under sudo</a
		>. The entire prefix (<code>/opt/homebrew</code>) is owned by your user, and
		<code>brew</code> will error out if you try to run it as root. This is an intentional design
		choice: it limits blast radius by keeping everything in userspace.
	</p>

	<p>
		Supply-chain risk, broadly, is the risk that any link in the chain between you and the software
		you install — the author, the build system, the distribution channel — gets compromised. In
		Homebrew's case, that chain is a Git repo full of Ruby scripts (the tap), an upstream source URL
		or vendor binary, and Homebrew's own <a href="https://docs.brew.sh/Bottles">bottle</a>
		infrastructure. A hijacked tap, a swapped source tarball, or a compromised cask URL all mean
		someone else's code running on your machine. The rest of this section covers what Homebrew gives
		you out of the box and what you can tighten up.
	</p>

	<h3>Know What You're Installing</h3>

	<p>
		Before you install something unfamiliar, you can print out the formula/cask source to review the
		Ruby script yourself (<code>brew cat</code>/<code>brew edit</code>). For formulae, the
		interesting bits are the <code>url</code>, <code>sha256</code>, and the <code>install</code>
		block — that's the code that actually runs on your machine. For casks, pay attention to the
		<code>sha256</code> and the <code>url</code> pointing at the vendor binary.
	</p>

	<p>
		Formulae from <code>homebrew/core</code> ship as
		<a href="https://docs.brew.sh/Bottles">bottles</a> by default — precompiled binaries built by
		<a href="https://docs.brew.sh/Brew-Test-Bot">BrewTestBot</a> on Homebrew's own CI
		infrastructure. Each bottle has a per-platform <code>sha256</code> checksum baked into the
		formula definition, so you're getting a reproducible artifact rather than building from an
		arbitrary source tarball. If a bottle isn't available for the requested platform, Homebrew falls
		back to building from source.
	</p>

	<p>
		Casks don't have the same CI story — they pull vendor binaries directly. You can enforce
		checksum verification for casks globally:
	</p>

	<pre><code># require a sha256 checksum for every cask install
$ export HOMEBREW_CASK_OPTS="--require-sha"

# or pass it per-command
$ brew install --cask --require-sha aws-sso</code></pre>

	<p>
		If a cask doesn't declare a <code>sha256</code>, the install will fail. This is a good way to
		catch casks that use <code>sha256 :no_check</code> (which means "trust the download URL
		blindly").
	</p>

	<h3>Auditing What's on Your Machine</h3>

	<pre><code># what's outdated (and potentially carrying known CVEs)
$ brew outdated

# what depends on a given formula
$ brew uses --installed openssl

# what taps are currently active
$ brew tap</code></pre>

	<p>
		A quick note on <code>brew audit</code>: it's a linting tool for formula/cask
		<em>contributors</em>, not an end-user security scanner. It checks style rules and packaging
		conventions. Useful if you're writing or reviewing a formula, but it won't tell you if something
		installed on your machine is compromised.
	</p>

	<h3>Tap Hygiene</h3>

	<p>
		Remember, every <code>brew tap</code> is a Git repo whose maintainers can deliver arbitrary Ruby
		code to your machine. Treat tapping like adding a third-party package registry — vet the repo,
		check who maintains it, and untap anything you're no longer using.
	</p>

	<p>
		You can restrict which taps are allowed on your machine entirely with the
		<code>HOMEBREW_ALLOWED_TAPS</code> environment variable:
	</p>

	<pre><code># only allow homebrew-core and one internal tap
export HOMEBREW_ALLOWED_TAPS="homebrew/core louislef299/aws-sso"</code></pre>

	<p>
		With this set, any <code>brew tap</code> or <code>brew install</code> from a tap not on the
		list will be refused. This is especially useful on managed machines where you want to prevent
		drive-by tapping.
	</p>

	<h3>Reproducibility with Brewfile</h3>

	<p>
		A <a href="https://docs.brew.sh/Brew-Bundle-and-Brewfile">Brewfile</a> is a declarative
		manifest of taps, formulae, casks, and even Mac App Store apps. It isn't a lockfile (Homebrew
		has no lockfile concept), so it won't pin you to exact versions. What it gives you is a
		declarative installation process, making it easy to install &amp; detect drift. Here's a sample
		<code>Brewfile</code>:
	</p>

	<pre><code># Brewfile
tap "louislef299/aws-sso"
tap "mike-engel/jwt-cli"

brew "git"
brew "gnupg"
brew "gh"
brew "jq"
brew "caddy"
brew "jwt-cli"
brew "aws-sso"

cask "firefox"

# enforce checksum verification for all casks in this Brewfile
cask_args require_sha: true</code></pre>

	<p>
		And here's how to manage your brews with the <code>Brewfile</code> and
		<code>brew bundle</code>:
	</p>

	<pre><code># generate a Brewfile from your current install state
$ brew bundle dump

# install everything declared in the ~/Brewfile
# use --file=~/.config/Brewfile for non-standard locations
$ brew bundle install

# check for drift
$ brew bundle check

# remove anything installed that isn't in the Brewfile
$ brew bundle cleanup --force</code></pre>

	<h2>Conclusion</h2>

	<p>
		Homebrew really makes installing software on Macs a breeze and <code>update</code>,
		<code>upgrade</code> &amp; <code>cleanup</code> can take you a long way. However, understanding
		the distinction between formulae &amp; casks, keeping your taps clean, enforcing checksums on
		cask installs, and declaratively maintaining your macOS packages with a <code>Brewfile</code>
		helps you become a power user.
	</p>

	<p>
		How is your system looking? Run <code>brew doctor &amp;&amp; brew outdated</code> right now!
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
