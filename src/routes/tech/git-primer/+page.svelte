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
		This post is just a simple primer on Git and how I would recommend leveraging it to improve
		productivity as an engineer. It's something I wish would have been around when I first started
		using it, but hopefully you find it useful.
	</p>

	<p>
		<strong><em>DISCLAIMER</em></strong>: This post is targeted at engineers. If this is your
		first time interacting with Git, I'd recommend starting with the
		<a href="https://git-scm.com/docs/gittutorial">gittutorial</a>.
	</p>

	<p>
		<strong><em>Update 2/10/26</em></strong>: Julia Evans wrote an excellent piece on the
		<a href="https://jvns.ca/blog/2026/01/08/a-data-model-for-git/">Git data model</a>. It goes
		over <a href="https://git-scm.com/docs/gitdatamodel">Git's core data model</a>, which defines
		some of the terminology commonly found in git like objects and references. If some of this
		vocabulary is confusing, I'd recommend skimming through the doc!
	</p>

	<h2>The Bare Minimum</h2>

	<p>
		<a href="https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F">What is Git?</a> Git
		is a distributed version control system(VCS) that tracks changes to files in a
		content-addressable filesystem. It is important to characterize Git as distributed because it
		keeps a copy of the entire dataset(repository) locally. Git has 3 main stages:
	</p>

	<img src="/image/tech/git-primer/git-flow-diagram.png" alt="Git Stages" loading="lazy" />

	<ol>
		<li>Modified =&gt; the file in your Git repo has changed but is not committed to your local database yet</li>
		<li>Staged(<code>git add</code>) =&gt; the file that is modified is marked as ready to move to the next commit snapshot</li>
		<li>Committed(<code>git commit</code>) =&gt; the data(file deltas) are safely stored in the local Git object database</li>
	</ol>

	<h3>Setting Up an Example</h3>

	<p>
		The following sets up a directory(<code>sample-repo</code>) and runs <code>git init</code>,
		which creates a <code>.git</code> directory with the required subdirectories.
	</p>

	<pre><code>$ mkdir sample-repo &amp;&amp; cd sample-repo

$ git init
Initialized empty Git repository in /Users/louis/sample-repo/.git/

# create an object(file) for git to track
$ echo "# Git Primer\n\nThis is a sample file\!\n" &gt; README.md

# view the contents of the .git directory
$ ls -F1 .git/
config
description
HEAD
hooks/
info/
objects/
refs/</code></pre>

	<h3>Adding Objects to the Staging Area</h3>

	<blockquote>
		<p>
			Unlike the other systems, Git has something called the "staging area" or "index". This is
			an intermediate area where commits can be formatted and reviewed before completing the
			commit (<a href="https://git-scm.com/about/staging-area">git-scm</a>)
		</p>
	</blockquote>

	<p>
		Adding objects to the staging area is very easy. Git has a super simple <code>status</code>
		command to output the changes that it detects and even offers advice for how to add these
		objects to the staging area.
	</p>

	<pre><code>$ git status
On branch main

No commits yet

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
        README.md

nothing added to commit but untracked files present (use "git add" to track)</code></pre>

	<p>
		To add the <code>README.md</code> to our staging area, just run
		<code>git add README.md</code>. You could also run <code>git add .</code>, which adds all
		files in the filesystem to the staging area. You should now see a hashed git object in our
		local Git folder:
	</p>

	<pre><code>$ git add README.md

$ find .git/objects -type f
.git/objects/cd/5248b519c57f2d80cd0ec240e23c7f90f992bb

# view the contents of the hashed object
$ git cat-file -p cd5248b519c57f2d80cd0ec240e23c7f90f992bb
# Git Primer

This is a sample file!</code></pre>

	<p>
		Now, let's make an edit to our file. If you append a line to the <code>README.md</code>, Git
		will detect the change:
	</p>

	<pre><code>$ echo "This should trigger a new version\n" &gt;&gt; README.md
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached &lt;file&gt;..." to unstage)
        new file:   README.md

Changes not staged for commit:
  (use "git add &lt;file&gt;..." to update what will be committed)
  (use "git restore &lt;file&gt;..." to discard changes in working directory)
        modified:   README.md</code></pre>

	<p>
		As you can see above, there are two versions of the same file. There is one version that is in
		the staging area(ready for commit) and there is another version not even staged for
		commit(not in the staging area). Run <code>git add .</code> to add the new version of
		<code>README.md</code> to the staging area. Funny enough, there will be a whole <em>new</em>
		object created:
	</p>

	<pre><code>$ find .git/objects -type f
.git/objects/39/1aaae4041bccd74a5ef7cbcc8829bb849bb8f1
.git/objects/cd/5248b519c57f2d80cd0ec240e23c7f90f992bb

# view the first version of README.md
$ git cat-file -p cd5248b519c57f2d80cd0ec240e23c7f90f992bb
# Git Primer

This is a sample file!

# view the latest version of README.md
$ git cat-file -p 391aaae4041bccd74a5ef7cbcc8829bb849bb8f1
# Git Primer

This is a sample file!

This should trigger a new version</code></pre>

	<h3>Creating a Commit</h3>

	<p>
		Creating a commit in Git takes the objects(files) in the staging area and stores that snapshot
		into the Git directory. Commits expect a message applied to them and an
		<a href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup">identity</a> to
		embed into the commit itself. You can commit by running:
	</p>

	<pre><code>$ git commit -m "initial commit"
[main (root-commit) a5b087d] initial commit
 1 file changed, 6 insertions(+)
 create mode 100644 README.md

 # view the new commit object
 $ git cat-file -p a5b087d
tree 7a7affd88353e0551dbc720e17c4e382cc4f6924
author Louis Lefebvre &lt;louis@gmail.com&gt; 1760640521 -0500
committer Louis Lefebvre &lt;louis@gmail.com&gt; 1760640521 -0500

initial commit

# view the commit object with log
$ git log
commit a5b087def21d7f5549ef253a7af845ebb1615035 (HEAD -&gt; main, origin/main)
Author: Louis Lefebvre &lt;louis@gmail.com&gt;
Date:   Thu Oct 16 13:48:41 2025 -0500

    initial commit</code></pre>

	<h4>A Quick Side Note</h4>

	<p>
		If you're a savvy developer and have been following along, you may have noticed that there were
		<em>two</em> new objects created with the <code>git commit</code> command:
	</p>

	<pre><code>$ find .git/objects -type f
.git/objects/a5/b087def21d7f5549ef253a7af845ebb1615035
.git/objects/39/1aaae4041bccd74a5ef7cbcc8829bb849bb8f1
.git/objects/cd/5248b519c57f2d80cd0ec240e23c7f90f992bb
.git/objects/7a/7affd88353e0551dbc720e17c4e382cc4f6924</code></pre>

	<p>
		This is due to <code>git commit</code> combining the creation of a tree object and a commit
		object to the Git object database, but this is beyond the scope of this post. Feel free to
		read up on the
		<a href="https://git-scm.com/book/en/v2/Git-Internals-Git-Objects">internals of Git objects</a>
		if you're interested!
	</p>

	<h3>Collaborate Leveraging Remotes</h3>

	<p>
		Now having this VCS locally is great! But it really isn't as useful if you can't backup this
		database on another device and share it with your friends. This is where those beloved
		<code>git push</code> and <code>git pull</code> come into play. But first, you need to create
		a remote.
	</p>

	<h4>Adding a New Remote</h4>

	<p>
		There are many ways to create a Git repository, so I'll provide a quick
		<a href="https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository">link with GitHub</a>
		as it seems to be the most popular option. Once you have a remote repository, copy the URL.
	</p>

	<p>
		Remote repositories represent another instance of the distributed Git database, but it is
		hosted on the internet. To add your first remote to your Git instance, run the
		<code>git remote add</code> command. Since this is our first remote, we are aliasing the
		remote with the default shortname <code>origin</code>.
	</p>

	<pre><code>$ git remote add origin https://github.com/louislef299/sample-repo.git

$ git remote -v
origin  https://github.com/louislef299/sample-repo.git (fetch)
origin  https://github.com/louislef299/sample-repo.git (push)</code></pre>

	<p>
		Now that our remote is setup properly, we can update our remote object database with the
		<code>git push</code> command. Since this is our first time pushing to the repository, I'm
		also going to add the remote shortname and the name of the branch to push:
	</p>

	<pre><code>$ git push origin main
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Delta compression using up to 10 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 282 bytes | 282.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To https://github.com/louislef299/sample-repo.git
 * [new branch]      main -&gt; main
branch 'main' set up to track 'origin/main'.</code></pre>

	<h4>Cloning an Existing Project</h4>

	<p>
		Since we were the initial contributors to our remote repository, we didn't have to
		<strong>clone</strong> or <strong>pull</strong> any changes before pushing. Very quickly, if
		you are going to <strong>clone</strong> a repository, you are basically creating a local copy
		of the Git database and the tracked filesystem. When you <strong>pull</strong>, you are both
		<strong>fetching</strong> the remote Git object database locally and reconciling any
		differences between you filesystem and the new file versions.
	</p>

	<p>
		To demonstrate these concepts, I'm going to clone the remote repository into a new directory
		called <code>sample-repo-clone</code> with the repository URL I created when I created the
		first remote:
	</p>

	<pre><code>$ git clone https://github.com/louislef299/sample-repo.git sample-repo-clone \
   &amp;&amp; cd sample-repo-clone
Cloning into 'sample-repo-clone'...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (3/3), done.

# validate that all the previous commits are pulled in
$ git log --oneline
a5b087d (HEAD -&gt; main, origin/main) initial commit</code></pre>

	<h4>Push New Changes</h4>

	<p>
		Next, let's <strong>push</strong> up a new change to our project! For fun, let's create a
		hello world program in Lua: <code>echo "print(\"hello, world\!\")" &gt;&gt; main.lua</code>.
		I'll let you <strong>add</strong>, <strong>commit</strong> and <strong>push</strong> your
		changes to the remote repository yourself. Feel free to reference the above documentation if
		you get stuck. Afterwards, change directories back to the original
		<code>sample-repo</code> directory(<code>cd ../sample-repo</code>).
	</p>

	<p>You'll notice that the Lua script isn't present:</p>

	<pre><code>$ ls
README.md

$ git log --oneline
a5b087d (HEAD -&gt; main, origin/main) initial commit</code></pre>

	<p>
		This is because you need to pull down the changes from the remote object database locally!
		This can be achieved with <code>git pull</code>:
	</p>

	<pre><code>$ git pull
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 283 bytes | 25.00 KiB/s, done.
From https://github.com/louislef299/sample-repo
   a5b087d..e617f78  main       -&gt; origin/main
Updating a5b087d..e617f78
Fast-forward
 main.lua | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 main.lua

# verify that the git commit history is as expected
$ git log --oneline
e617f78 (HEAD -&gt; main, origin/main, origin/HEAD) hello, lua
a5b087d initial commit

$ ls
main.lua        README.md</code></pre>

	<h2>Conclusion</h2>

	<p>
		This was a very quick introduction to Git from my perspective. If anything was confusing or
		didn't make sense, let me know! Also, please refer to the
		<a href="https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control">authoritative documentation</a>
		to answer any lingering questions you may have.
	</p>

	<p>
		Want more Git commands? <a href="https://ohshitgit.com/">ohshitgit</a>(s/o Chris) is a great
		scenario-based resource to bookmark.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
