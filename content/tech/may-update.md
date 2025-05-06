---
title: "May Update"
date: 2025-05-06T14:14:51-05:00
draft: false
---

Just a small update. At work, things have been a little hectic with trying to
balance getting actual work done while massaging different egos to win political
favor. Anyways, most of the work that I've laid down is ready for somebody to
take action on, but I've decided to focus more on my side projects in my free
time for now as long as my company doesn't think my efforts are worth their
time.

So, an update on some of my bluetooth programming: since the Go DBus programming
has been a grind and I would have to basically invent a whole new library just
to work with it, I've decided that I should move back to a more naturally
embedded language. This decision came with the realization that I would likely
want more control over my application code when working with bluetooth to make
it more performant and reliable.

Initially, I figured I'd go back to C, because most of the libraries I need are
written in C and I do enjoy some of the programming concepts that were inherited
from C to Go that improve overall language stability. The difficult parts of
writing in C revolved around thread and memory management, however, and had some
features that contributed to overly-complex code.

> Clear is better than clever -- [Rob Pike][]

Then I started to toss around the idea of getting back into C++ or Rust, but it
was a tough idea to swallow just because those languages are known to have a
steep learning curve and I just wanted to mess around with bluetooth for fun.
Then, I ran into [Zig][].

What I found the most appealing about it was it solved some of the more complex
memory allocation problems, while also allowing for cross-compiling with
existing C code... perfect for my use case! This way I can work with a more
modern programming language while using old libraries that hadn't yet been
migrated over to Zig(maybe I could eventually contribute?).

Anyways, I just wanted to give a quick update on where I'm at here since it has
been a while. Most of what I've been doing is [learning Zig][] when I have time
and doing boring projects to get used to the language. Hopefully I'll have an
updated [rmt][] project that is fully written in Zig by the end of the month.

Until then, happy Spring!🌞

[learning Zig]: https://www.openmymind.net/learning_zig/
[rmt]: https://github.com/louislef299/rmt
[Rob Pike]: https://go-proverbs.github.io/
[Zig]: https://ziglang.org/
