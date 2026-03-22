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
		More recently, I've been programming in Java &amp; Kotlin for both backend development with
		legacy codebases and Android development for fun. I've found that while revolutionary for its
		time, Java really wasn't able to meet the requirements of a modern programming language, and
		Kotlin is trying to fill that gap.
	</p>

	<p>
		However, I've honestly been finding it hard to stay motivated becoming proficient with the
		language. Call me old-fashioned, but I still believe in the 10,000 hour rule to master a topic,
		which just means that I believe that proficiency requires time and effort. No amount of AI
		support can change that. One thing that has interested me recently is the Java build process; in
		particular, JAR files and GraalVM. So, this article is just going to cover some research and
		exist as a general reference for me in the future.
	</p>

	<p>
		This article assumes you are comfortable with the
		<a href="https://dev.java/learn/jvm/tools/core/javac/">Java compiler</a>.
	</p>

	<h2>The Basics</h2>

	<p>
		First off, JAR stands for <strong>J</strong>ava <strong>AR</strong>chive and is a file archive
		and compression format that allows for the aggregation of all
		<a href="https://en.wikipedia.org/wiki/Java_class_file">Java class files</a> and their
		associated metadata required to run an application. Very similar to tar or zip(and I guess
		<a href="https://en.wikipedia.org/wiki/Pax_(command)">pax</a>??), just specific to Java. JAR
		files improve portability and security of Java applications.
	</p>

	<p>
		Before the introduction of JAR, web browsers encountering a Java applet within a webpage had to
		establish separate connections for each individual component of the applet, including class
		files, images, and
		sounds<sup><a href="https://medium.com/@youeleven/what-are-jar-files-in-java-7363bcf5380f">1</a></sup>.
		Although Java isn't really used in web applications anymore, they still provide security benefits
		through signing and improved download times are useful in cloud native settings.
	</p>

	<h3>JAR Command-Line</h3>

	<p>
		If you're using Gradle, it's as simple as running <code>./gradlew bootJar</code> and your JAR
		file can be found in <code>app/build/lib/</code>. The JAR file can be titled anything, I just
		stuck with <code>app.jar</code>, but here is how to use native <code>jar</code>:
	</p>

	<pre><code># Create the archive with the listed files(verbose output)
jar cvf app.jar &lt;class files&gt;
# Create an executable JAR by specifying main class
jar cfe app.jar &lt;main class&gt; &lt;class files&gt;
# Print the output to stdout
jar c app.jar &lt;class files&gt;

# View the JAR contents(verbose output)
jar tvf app.jar
# Simple view contents of JAR
jar tf app.jar

# Extract a JAR file
jar xf app.jar &lt;optional file to extract&gt;
# or even just use zip
unzip app.jar

# Add(Update) file to JAR(verbose output)
jar uvf app.jar &lt;file&gt;</code></pre>

	<h3>Manifest Files</h3>

	<p>
		You may have noticed when you were looking in the JAR file that there was a
		<code>MANIFEST.MF</code> file. It's the secret sauce of JAR and holds all the metadata required
		for JAR to take action. A very simple manifest looks like:
	</p>

	<pre><code>$ cat META-INF/MANIFEST.MF
Manifest-Version: 1.0
Created-By: 24.0.2 (Amazon.com Inc.)
Main-Class: Hello</code></pre>

	<p>
		Basically, you can learn that I am using
		<a href="https://aws.amazon.com/corretto/">Java Corretto</a> and that this JAR is an Executable
		JAR due to the specification of <code>Main-Class</code>. It enables me to execute the JAR with
		<code>java -jar app.jar</code>. I'm starting to come to the conclusion that Docker got all of
		its ideas from Java...
	</p>

	<p>
		Now let's say we want to include a version in our manifest file. This requires us to create our
		manifest prior to JAR packaging and pass it into our command. To make things easy, let's pull
		out our existing <code>MANIFEST.MF</code> and update it directly. We will just be setting the
		<a href="https://docs.oracle.com/javase/tutorial/deployment/jar/packageman.html"><code>Specification-Version</code></a>:
	</p>

	<pre><code>$ jar xf app.jar META-INF/MANIFEST.MF

# Adding 'Specification-Version: 1.0' to the manifest
$ emacs META-INF/MANIFEST.MF
$ jar cvfm app.jar META-INF/MANIFEST.MF *.class LICENSE
added manifest
adding: Hello.class(in = 417) (out= 286)(deflated 31%)
adding: LICENSE(in = 32474) (out= 11182)(deflated 65%)</code></pre>

	<p>
		And that creates the Manifest based on the existing one we provided with the correct
		<code>Specification-Version</code> included. Just a heads up:
	</p>

	<blockquote>
		<p>
			Warning: The text file must end with a new line or carriage return. The last line will not be
			parsed properly if it does not end with a new line or carriage return.
		</p>
	</blockquote>

	<p>
		To <em>Seal</em> a JAR file, just add <code>Seal: true</code> to the manifest file. This
		ensures that all classes in a package come from the same source. <code>Class-Path</code> tells
		the JVM where to find additional classes needed at runtime. There are additional
		<a href="https://docs.oracle.com/javase/tutorial/deployment/jar/secman.html">Security Attributes</a>
		that can be configured.
	</p>

	<h2>Conclusion</h2>

	<p>
		In a desire to keep this post short, I'm going to end here and hopefully create another post for
		GraalVM and <a href="https://en.wikipedia.org/wiki/Huffman_coding">Huffman coding</a>. You can
		<a href="https://docs.oracle.com/javase/tutorial/deployment/jar/signindex.html">sign JARs</a>
		as well, but my previous post covered signing binaries, so I'll leave it be for now.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
