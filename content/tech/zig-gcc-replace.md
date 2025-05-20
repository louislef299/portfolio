---
title: "Improving My C Build System with Zig"
date: 2025-05-20T10:18:34-05:00
draft: false
tags:
- zig
- sysprog
---

Since I've been messing around with [zig][] recently, I decided one of the
simplest ways for me to work with zig is to integrate it into one of my existing
C project by [replacing gcc/clang with zig][]. Even though zig has a bunch of
additional features that clang does not, we will keep it simple and just
restructure clang as-is and work on improvements later.

## Current Sitch

The C project I'll be improving is my [custom shell][] that I wrote in college.
It uses memory emulation, so it isn't fully functional, but it definitely could
use the improvement!

Since I will likely have the new code merged by the time you, random nerd, are
reading this, here is my current file structure:

```bash
louis[shell]@main > tree
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

1 directory, 11 files
```

with a `Makefile` that looks like:

```make
.DEFAULT_GOAL := default

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
    docker container prune -f && docker image prune -f
```

## Replace gcc with zig

One of the first things I did was actually place all of my C files into a `src/`
folder similar to other zig project structures. That just required fixing all of
the file references to include the `src/` prefix.

Next, I simply had to replace `gcc` with `zig cc`:

```bash
louis[shell]@replace-make > git diff 41f97f4
diff --git a/Makefile b/Makefile
index be25833..4a36c04 100644
--- a/Makefile
+++ b/Makefile
@@ -1,7 +1,7 @@
 .DEFAULT_GOAL := default

-GCC ?= /usr/bin/gcc
+GCC ?= zig cc
```

and that was literally it! Everything compiled properly! That was so darn simple
that in this post, I'll also be migrating from using `make` as my build system
to fully migrating to `zig build`.

## Replace make with zig build

First, just going over the benefits of migrating away from `make`:

- Dependency-Free Builds(other than zig itself)
- Cross-Compilation
- Package Management
- Improved Performance(logical concurrency defaults and caching)
- Declarative Syntax

The zig project has an official [Zig Build System][] document, but I will also
be running through [Zig Build Explained][], which may be a bit older, but might
give me some good insight into some of the newer and more complex build options.

### Just Port Make

Without removing the dependency on `make`, we *can* just run a system command
within the zig build system. Although this doesn't actually solve any of our
problems, it gets us comfortable with some of the zig syntax and [build
`Step`][]:

```c
const std = @import("std");

pub fn build(b: *std.Build) void {
    const make_step = b.addSystemCommand(&[_][]const u8{
        "make", "default",
    });
    const default = b.step("default", "Run the default make step");
    default.dependOn(&make_step.step);
}
```

By running `zig build default`, we get the exact same output we would expect if
we ran `make`.

### Maintain it with zig

Next, let's update the build step in the `Makefile` to ziglang.

#### Standard Build Options

First, we have to setup some default values in the zig build process:

```c
const target = b.standardTargetOptions(.{});
const optimize = b.standardOptimizeOption(.{});
```

I'm just going to quote the official [Zig docs][] here:

> Standard target options allows the person running zig build to choose what
> target to build for. By default, any target is allowed, and no choice means to
> target the host system. Other options for restricting supported target set are
> available.
>
> Standard optimization options allow the person running zig build to select
> between Debug, ReleaseSafe, ReleaseFast, and ReleaseSmall. By default none of
> the release options are considered the preferable choice by the build script,
> and the user must make a decision in order to create a release build.

#### Building the C Executable

```c
const lsh = b.addExecutable(.{
    .name = "lsh",
    .root_module = b.createModule(.{
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    }),
});
```

The above creates an executable for the build process. The docs weren't *quite*
up-to-date as they didn't yet use the `.root_module` pattern. At first, I was
confused on what a module even was, but [according to Andrew][], it is:

> A module is a directory of files, along with a root source file that
> identifies the file referred to when the module is used with @import

So, pretty simple syntax, the above will create an executable named `lsh` and I
pass along the `target` and `optimize` flags from the `build` command. Since
`shell` uses standard C library functions(like `printf`, `malloc`, `free`, etc),
I also need to set `.link_libc = true` to ensure that those functions are
available at runtime.

Next, I just have to add all of my C source files and the standard flags to run.
Super easy to do:

```c
lsh.addCSourceFiles(.{ .files = &.{
    "src/disk.c",
    "src/fs.c",
    "src/main.c",
    "src/shell.c",
}, .flags = &.{
    "-Wall",
    "-c",
    "-g",
} });
```

and finally, to ensure that this gets executed with `zig build`, I have to
finish with:

```c
b.installArtifact(lsh);
```

For builds that a slightly more complex, I'd recommend checking out the [Build
System Tricks][] to see an example of when to use `addInstallArtifact`.

## Conclusion

Zig is a fantastic language and has been super fun learning. To see the full
working code, check out the [custom shell][](no promises on the app working or
anything). Since zig is still super young, there are some quirks here and there,
but part of the enjoyment of learning the language has been searching through
their many community pages or just their git repository. Hoping to post more as
I explore further!

[according to Andrew]: https://github.com/ziglang/zig/issues/14307
[build `Step`]: https://ziglang.org/documentation/master/std/#std.Build.Step
[Build System Tricks]: https://ziggit.dev/t/build-system-tricks/3531#p-12644-h-6-add-build-artifacts-to-depend-on-7
[custom shell]: https://github.com/louislef299/shell
[replacing gcc/clang with zig]: https://andrewkelley.me/post/zig-cc-powerful-drop-in-replacement-gcc-clang.html
[zig]: https://ziglang.org/
[Zig Build Explained]: https://zig.news/xq/zig-build-explained-part-1-59lf
[Zig Build System]: https://ziglang.org/learn/build-system/
[Zig docs]: https://ziglang.org/learn/build-system/#standard-options
