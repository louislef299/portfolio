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
		In a <a href="/tech/notarize-aws-sso/#quickstart-gpg">previous post</a>, I went over some of
		the basics of GPG keys. Since then, I've been playing around with them a bit more and have found
		them useful for
		<a href="https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work"
			>signing git commits and git tags</a
		>. The rest of this post will assume "your work" is "your work against a git repository".
	</p>

	<p>
		To sign your work, you need a GPG key. If you don't have a key yet, you can simply configure
		one with the defaults: <code>gpg --gen-key</code>. Now that you have it, you can set your
		global git configuration setting to use this key by ID:
	</p>

	<pre><code>$ gpg --list-keys --keyid-format LONG "Louis LeFebvre"
pub   ed25519/1ED70AB11E01B8DB 2025-11-06
uid         [ultimate] Louis LeFebvre &lt;louislefebvre1999@gmail.com&gt;

$ git config --global user.signingkey 1ED70AB11E01B8DB</code></pre>

	<p>
		Then, if I require a repository to have signed work in general, it's just a matter of setting my
		local git config: <code>git config --local commit.gpgsign true</code>. Now, I can see my
		commits are signed:
	</p>

	<pre><code>$ git log --show-signature -1
commit c95ea0fb015731bee9d118ce7dc780fc8017807d (HEAD -&gt; git-gpg)
gpg: Signature made Thu Nov  6 08:58:25 2025 CST
gpg:                using EDDSA key 1D1A36C7214DCD5441BC58721ED70AB11E01B8DB
gpg: Good signature from "Louis LeFebvre &lt;louislefebvre1999@gmail.com&gt;" [ultimate]
Author: Louis LeFebvre &lt;louislefebvre1999@gmail.com&gt;
Date:   Thu Nov 6 08:56:35 2025 -0600

    docs: Add git-gpg post</code></pre>

	<p>
		Instead of setting <code>commit.gpgsign</code>, you can also sign an individual commit with the
		<code>-S</code> flag. This is great and all, but as you can see, my gpg key is still unverified
		in my actual GitHub repository:
	</p>

	<img src="/image/tech/git-gpg/gpg-unverified.png" alt="GPG GitHub" loading="lazy" />

	<p>
		Follow the link to add a GPG key under your user settings. Name it whatever you like and get the
		public key for your GPG signing key with <code>gpg --armor --export &lt;keyID&gt;</code> and copy
		the output. After importing the key, you should now have a blue <code>Verified</code> tag on the
		commit!
	</p>

	<div style="text-align:center;">
		<img
			src="/image/tech/git-gpg/hackerman-mr-robot.jpg"
			alt="Hackerman"
			style="width:70%;height:70%;"
			loading="lazy"
		/>
	</div>

	<p>
		As you're working with GPG and git, you may also run into the following error:
	</p>

	<pre><code>gpg: signing failed: Inappropriate ioctl for device

fatal: failed to write commit object</code></pre>

	<p>
		This is due to GPG being unable to prompt for the key passphrase and needs to be told what
		<code>tty</code> to use. The fix is to set <code>GPG_TTY=$(tty)</code>, which I just set in my
		shell configuration file.
	</p>

	<p>
		If you would like more commands related to GPG, feel free to check out this
		<a href="https://gock.net/blog/2020/gpg-cheat-sheet">GPG cheatsheet</a>.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
