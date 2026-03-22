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
		Since I've been messing around with <a href="https://ziglang.org/">zig</a> recently, I decided
		one of the simplest ways for me to work with zig is to integrate it into one of my existing C
		project by
		<a href="https://andrewkelley.me/post/zig-cc-powerful-drop-in-replacement-gcc-clang.html"
			>replacing gcc/clang with zig</a
		>. Even though zig has a bunch of additional features that clang does not, we will keep it
		simple and just restructure clang as-is and work on improvements later.
	</p>

	<h2>Current Sitch</h2>

	<p>
		The C project I'll be improving is my
		<a href="https://github.com/louislef299/shell">custom shell</a> that I wrote in college. It
		uses memory emulation, so it isn't fully functional, but it definitely could use the
		improvement!
	</p>

	<p>
		Since I will likely have the new code merged by the time you, random nerd, are reading this,
		here is my current file structure:
	</p>

	<pre><code>louis[shell]@main &gt; tree
.
├── disk.c
├── disk.h
├── Dockerfile
├── fs.c
├── fs.h
├── LICENSE
├── main.c
├── Makefile
├── README.md
├── shell.c
└── shell.h

1 directory, 11 files</code></pre>

	<p>with a <code>Makefile</code> that looks like:</p>

	<pre><code>.DEFAULT_GOAL := default

GCC ?= /usr/bin/gcc

default: shell.o fs.o disk.o
    $(GCC) -Wall main.c shell.o disk.o fs.o -o lsh -g

shell.o: shell.c shell.h
    $(GCC) -Wall shell.c -c -o shell.o -g

fs.o: fs.c fs.h
    $(GCC) -Wall fs.c -c -o fs.o -g

disk.o: disk.c disk.h
    $(GCC) -Wall disk.c -c -o disk.o -g

container:
    docker build -t lsh .

clean:
    rm -rf *.o lsh lsh.*
    docker container prune -f &amp;&amp; docker image prune -f</code></pre>

	<h2>Replace gcc with zig</h2>

	<p>
		One of the first things I did was actually place all of my C files into a <code>src/</code>
		folder similar to other zig project structures. That just required fixing all of the file
		references to include the <code>src/</code> prefix.
	</p>

	<p>Next, I simply had to replace <code>gcc</code> with <code>zig cc</code>:</p>

	<pre><code>louis[shell]@replace-make &gt; git diff 41f97f4
diff --git a/Makefile b/Makefile
index be25833..4a36c04 100644
--- a/Makefile
+++ b/Makefile
@@ -1,7 +1,7 @@
 .DEFAULT_GOAL := default

-GCC ?= /usr/bin/gcc
+GCC ?= zig cc</code></pre>

	<p>
		and that was literally it! Everything compiled properly! That was so darn simple that in this
		post, I'll also be migrating from using <code>make</code> as my build system to fully migrating
		to <code>zig build</code>.
	</p>

	<h2>Replace make with zig build</h2>

	<p>First, just going over the benefits of migrating away from <code>make</code>:</p>

	<ul>
		<li>Dependency-Free Builds(other than zig itself)</li>
		<li>Cross-Compilation</li>
		<li>Package Management</li>
		<li>Improved Performance(logical concurrency defaults and caching)</li>
		<li>Declarative Syntax</li>
	</ul>

	<p>
		The zig project has an official
		<a href="https://ziglang.org/learn/build-system/">Zig Build System</a> document, but I will
		also be running through
		<a href="https://zig.news/xq/zig-build-explained-part-1-59lf">Zig Build Explained</a>, which
		may be a bit older, but might give me some good insight into some of the newer and more complex
		build options.
	</p>

	<h3>Just Port Make</h3>

	<p>
		Without removing the dependency on <code>make</code>, we <em>can</em> just run a system command
		within the zig build system. Although this doesn't actually solve any of our problems, it gets
		us comfortable with some of the zig syntax and
		<a href="https://ziglang.org/documentation/master/std/#std.Build.Step">build <code>Step</code></a
		>:
	</p>

	<pre><code>const std = @import("std");

pub fn build(b: *std.Build) void {'{'}
    const make_step = b.addSystemCommand(&amp;[_][]const u8{'{'}
        "make", "default",
    {'}'});
    const default = b.step("default", "Run the default make step");
    default.dependOn(&amp;make_step.step);
{'}'}</code></pre>

	<p>
		By running <code>zig build default</code>, we get the exact same output we would expect if we
		ran <code>make</code>.
	</p>

	<h3>Maintain it with zig</h3>

	<p>
		Next, let's update the build step in the <code>Makefile</code> to ziglang.
	</p>

	<h4>Standard Build Options</h4>

	<p>First, we have to setup some default values in the zig build process:</p>

	<pre><code>const target = b.standardTargetOptions(.{'{'}{'}'});
const optimize = b.standardOptimizeOption(.{'{'}{'}'});</code></pre>

	<p>
		I'm just going to quote the official
		<a href="https://ziglang.org/learn/build-system/#standard-options">Zig docs</a> here:
	</p>

	<blockquote>
		<p>
			Standard target options allows the person running zig build to choose what target to build
			for. By default, any target is allowed, and no choice means to target the host system. Other
			options for restricting supported target set are available.
		</p>
		<p>
			Standard optimization options allow the person running zig build to select between Debug,
			ReleaseSafe, ReleaseFast, and ReleaseSmall. By default none of the release options are
			considered the preferable choice by the build script, and the user must make a decision in
			order to create a release build.
		</p>
	</blockquote>

	<h4>Building the C Executable</h4>

	<pre><code>const lsh = b.addExecutable(.{'{'}
    .name = "lsh",
    .root_module = b.createModule(.{'{'}
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    {'}'}),
{'}'});</code></pre>

	<p>
		The above creates an executable for the build process. The docs weren't <em>quite</em>
		up-to-date as they didn't yet use the <code>.root_module</code> pattern. At first, I was
		confused on what a module even was, but
		<a href="https://github.com/ziglang/zig/issues/14307">according to Andrew</a>, it is:
	</p>

	<blockquote>
		<p>
			A module is a directory of files, along with a root source file that identifies the file
			referred to when the module is used with @import
		</p>
	</blockquote>

	<p>
		So, pretty simple syntax, the above will create an executable named <code>lsh</code> and I pass
		along the <code>target</code> and <code>optimize</code> flags from the <code>build</code>
		command. Since <code>shell</code> uses standard C library functions(like <code>printf</code>,
		<code>malloc</code>, <code>free</code>, etc), I also need to set
		<code>.link_libc = true</code> to ensure that those functions are available at runtime.
	</p>

	<p>
		Next, I just have to add all of my C source files and the standard flags to run. Super easy to
		do:
	</p>

	<pre><code>lsh.addCSourceFiles(.{'{'} .files = &amp;.{'{'}
    "src/disk.c",
    "src/fs.c",
    "src/main.c",
    "src/shell.c",
{'}'}, .flags = &amp;.{'{'}
    "-Wall",
    "-c",
    "-g",
{'}'} {'}'});</code></pre>

	<p>
		and finally, to ensure that this gets executed with <code>zig build</code>, I have to finish
		with:
	</p>

	<pre><code>b.installArtifact(lsh);</code></pre>

	<p>
		For builds that a slightly more complex, I'd recommend checking out the
		<a
			href="https://ziggit.dev/t/build-system-tricks/3531#p-12644-h-6-add-build-artifacts-to-depend-on-7"
			>Build System Tricks</a
		>
		to see an example of when to use <code>addInstallArtifact</code>.
	</p>

	<h2>Conclusion</h2>

	<p>
		Zig is a fantastic language and has been super fun learning. To see the full working code, check
		out the <a href="https://github.com/louislef299/shell">custom shell</a>(no promises on the app
		working or anything). Since zig is still super young, there are some quirks here and there, but
		part of the enjoyment of learning the language has been searching through their many community
		pages or just their git repository. Hoping to post more as I explore further!
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
