---
title: "JAR Files -- Containers for Java?"
date: 2025-07-23T10:20:59-05:00
draft: false
tags:
- java
- sysprog
---

More recently, I've been programming in Java & Kotlin for both backend
development with legacy codebases and Android development for fun. I've found
that while revolutionary for its time, Java really wasn't able to meet the
requirements of a modern programming language, and Kotlin is trying to fill that
gap.

However, I've honestly been finding it hard to stay motivated becoming
proficient with the language. Call me old-fashioned, but I still believe in the
10,000 hour rule to master a topic, which just means that I believe that
proficiency requires time and effort. No amount of AI support can change that.
One thing that has interested me recently is the Java build process; in
particular, JAR files and GraalVM. So, this article is just going to cover some
research and exist as a general reference for me in the future.

This article assumes you are comfortable with the [Java compiler][].

## The Basics

First off, JAR stands for **J**ava **AR**chive and is a file archive and
compression format that allows for the aggregation of all [Java class files][]
and their associated metadata required to run an application. Very similar to
tar or zip, just specific to Java. JAR files improve portability and security of
Java applications.

Before the introduction of JAR, web browsers encountering a Java applet within a
webpage had to establish separate connections for each individual component of
the applet, including class files, images, and sounds[1][What are JAR files].
Although Java isn't really used in web applications anymore, they still provide
security benefits through signing and improved download times are useful in
cloud native settings.

### JAR Command-Line

If you're using Gradle, it's as simple as running `./gradlew bootJar` and your
JAR file can be found in `app/build/lib/`. The JAR file can be titled anything,
I just stuck with `app.jar`, but here is how to use native `jar`:

```bash
# Create the archive with the listed files(verbose output)
jar cvf app.jar <class files>
# Create an executable JAR by specifying main class
jar cfe app.jar <main class> <class files>
# Print the output to stdout
jar c app.jar <class files>

# View the JAR contents(verbose output)
jar tvf app.jar
# Simple view contents of JAR
jar tf app.jar

# Extract a JAR file
jar xf app.jar <optional file to extract>
# or even just use zip
unzip app.jar

# Add(Update) file to JAR(verbose output)
jar uvf app.jar <file>
```

### Manifest Files

You may have noticed when you were looking in the JAR file that there was a
`MANIFEST.MF` file. It's the secret sauce of JAR and holds all the metadata
required for JAR to take action. A very simple manifest looks like:

```bash
lefebl4[simple] > cat META-INF/MANIFEST.MF 
Manifest-Version: 1.0
Created-By: 24.0.2 (Amazon.com Inc.)
Main-Class: Hello
```

Basically, you can learn that I am using [Java Corretto][] and that this JAR is
an Executable JAR due to the specification of `Main-Class`. It enables me to
execute the JAR with `java -jar app.jar`. I'm starting to come to the conclusion
that Docker got all of its ideas from Java...

Now let's say we want to include a version in our manifest file. This requires
us to create our manifest prior to JAR packaging and pass it into our command.
To make things easy, let's pull out our existing `MANIFEST.MF` and update it
directly. We will just be setting the [`Specification-Version`][PackageMan]:

```bash
$ jar xf app.jar META-INF/MANIFEST.MF

# Adding 'Specification-Version: 1.0' to the manifest
$ emacs META-INF/MANIFEST.MF 
$ jar cvfm app.jar META-INF/MANIFEST.MF *.class LICENSE
added manifest
adding: Hello.class(in = 417) (out= 286)(deflated 31%)
adding: LICENSE(in = 32474) (out= 11182)(deflated 65%)
```

And that creates the Manifest based on the existing one we provided with the
correct `Specification-Version` included. Just a heads up:

> Warning: The text file must end with a new line or carriage return. The last
> line will not be parsed properly if it does not end with a new line or
> carriage return.

To *Seal* a JAR file, just add `Seal: true` to the manifest file. This ensures
that all classes in a package come from the same source. `Class-Path` tells the
JVM where to find additional classes needed at runtime. There are additional
[Security Attributes][] that can be configured.

## Conclusion

In a desire to keep this post short, I'm going to end here and hopefully create
another post for GraalVM and [Huffman coding][]. You can [sign JARs][] as well,
but my previous post covered signing binaries, so I'll leave it be for now.

[Huffman coding]: https://en.wikipedia.org/wiki/Huffman_coding
[Java class files]: https://en.wikipedia.org/wiki/Java_class_file
[Java compiler]: https://dev.java/learn/jvm/tools/core/javac/
[Java Corretto]: https://aws.amazon.com/corretto/
[PackageMan]: https://docs.oracle.com/javase/tutorial/deployment/jar/packageman.html
[Security Attributes]: https://docs.oracle.com/javase/tutorial/deployment/jar/secman.html
[sign JARs]: https://docs.oracle.com/javase/tutorial/deployment/jar/signindex.html
[What are JAR Files]: https://medium.com/@youeleven/what-are-jar-files-in-java-7363bcf5380f
