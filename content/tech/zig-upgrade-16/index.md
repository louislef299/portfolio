---
title: "Dusting Off ishi for Zig 0.16.0"
date: 2026-05-15T23:09:49-05:00
draft: false
toc: true
tags:
  - zig
---

The Wolves are getting hammered. Game 6 Western Semis against the Spurs, who lead the series 3-2. I decided it wouldn't hurt to do a little multi-tasking — half-watching the game, half-staring at a GitHub Actions tab — and figured if my evening plans were a little bitter, I might as well make it a bitter-sweet and dust off a side project that needed some love, [ishi][ishi].

A quick background on ishi, it's essentially "pgvector storage for git intelligence". You point it at a repo, it embeds your commit history into a pgvector database, and then you can ask it semantic questions like *"what changed about the build system?"* and it'll pull the most relevant commits back. I hadn't touched it in a few weeks. So I opened the repo and noticed the CI was red, and I'd been poking at [Zig 0.16.0][zig-016] in a tiny toy repo called [hash][] to learn [swiss tables][], so I figured it was a good time to upgrade.

![Ant flexing](./ant-flex.gif)

## A new fingerprint, fetch some resources

The CI log was unambiguous:

```
/home/runner/work/ishi/ishi/build.zig.zon:41:21: error: hash mismatch:
manifest declares 'zul-0.0.0-1oDot9yRBwDA_ovd6GC1M_ViW3LarywMaGrH6vcuEjqv'
but the fetched package has 'zul-0.0.0-1oDot4qXBwCHBYRdqx2aqkVPgcXiIOm9GXT5zLOCf_H3'
```

A quick peek at `build.zig.zon` revealed why — I'd lazily pinned the `zul` dep to `…/zul/archive/master.tar.gz`, which is the exact opposite of a pin:

```zig
.{
    .name = .ishi,
    .version = "0.0.0",
    .fingerprint = 0xa89789cfdd52da45, // never changes
    .minimum_zig_version = "0.15.2",
    .dependencies = .{
        .zul = .{
            .url = "https://github.com/karlseguin/zul/archive/master.tar.gz",
            .hash = "zul-0.0.0-1oDot9yRBwDA_ovd6GC1M_ViW3LarywMaGrH6vcuEjqv",
        },
    },
}
```

Karl Seguin had merged "Writergate part 2" into `zul/master` since my last commit, so the tarball moved, the hash changed, CI cried. The two-second fix would have been `zig fetch --save=zul` against an immutable commit URL:

```sh
$ zig fetch --save=zul https://github.com/karlseguin/zul/archive/776ba3b7db3bb03784a768d90c23dee26dee3268.tar.gz
warning: overwriting existing dependency named 'zul'
```

That regenerates the `.hash` entry in `build.zig.zon` for you — no hand-editing required. But before I knew it, I was rolling my sleeves up: if I was already in this file, I might as well bump `.minimum_zig_version = "0.16.0"` and do the whole upgrade properly. Zig 0.16.0 had landed in January[^1] and I'd been wanting an excuse to play with it.

## Goodbye, zul

The first surprise: with `.minimum_zig_version = "0.16.0"` set, `zig build` died inside `zul/src/arc.zig`:

```
zul/src/arc.zig:34:18: error: invalid builtin function: '@Type'
    const Args = @Type(.{
                 ^~~~~
```

The Zig 0.16.0 [release notes][zig-016] confirm: `@Type` was removed and replaced by individual builtins (`@Int`, `@Struct`, `@Tuple`, …). Karl hasn't patched `arc.zig` yet, and there's a closed PR that didn't land. So zul on 0.16.0 is a no-go until upstream catches up.

I almost forked it. Then I looked at how much of zul I was actually using:

```sh
$ grep -rn 'zul' src/
src/lib/runner.zig:2:const zul = @import("zul");
src/lib/runner.zig:67:    var client = zul.http.Client.init(allocator);
src/lib/runner.zig:114:   var client = zul.http.Client.init(allocator);
```

Two call sites of `zul.http.Client`. That's it. And meanwhile the 0.16.0 release notes were *bragging* about the new [`std.http.Client`][zig-016] — first-class, async DNS, happy-eyeballs, the works. Why was I hauling around a dep?

So out it went. The replacement uses the high-level `client.fetch` helper plus an `std.Io.Writer.Allocating` to capture the response body:

```zig
fn postJson(
    allocator: std.mem.Allocator,
    io: std.Io,
    endpoint: []const u8,
    body: []const u8,
) ![]u8 {
    var client: std.http.Client = .{ .allocator = allocator, .io = io };
    defer client.deinit();

    var response_buf: std.Io.Writer.Allocating = .init(allocator);
    defer response_buf.deinit();

    const result = try client.fetch(.{
        .location = .{ .url = endpoint },
        .method = .POST,
        .payload = body,
        .headers = .{ .content_type = .{ .override = "application/json" } },
        .response_writer = &response_buf.writer,
    });

    const status_int = @intFromEnum(result.status);
    if (status_int < 200 or status_int >= 300) {
        return error.RunnerRequestFailed;
    }
    return response_buf.toOwnedSlice();
}
```

Karl, if you're reading this — your libraries got me a long way. Just got lapped by the standard library this time around.

## Juicy main

This is the part of the upgrade that makes me so happy I decided to learn Zig. Zig 0.16.0 introduced ["Juicy Main"][juicy-main]: `pub fn main` now takes a `std.process.Init` parameter that hands you a bunch of "*pre-initialized goodies*".

```zig
pub fn main(init: std.process.Init) !void {
    const allocator = init.gpa;
    // const io = init.io;
    // const args = try init.minimal.args.toSlice(init.arena.allocator());

    const f = try Flags.init(allocator, init);
    defer f.deinit();
    // ...
}
```

`init.gpa` is a debug-mode-leak-checked general-purpose allocator. `init.arena` is a process-lifetime `ArenaAllocator` — perfect for things like command-line args that can just live until the program exits. `init.io` is the new `std.Io` implementation. No more boilerplate setup; no more `defer gpa.deinit()` ceremony. The runtime owns it.

I'd already test-driven this pattern in [hash][hash], so it felt great to finally bring it into a real project. Across `src/main.zig` and `src/cmd/Flags.zig`, the upgrade was maybe ten lines of net change — the old `std.process.argsAlloc` / `argsFree` dance became a single `init.minimal.args.toSlice(init.arena.allocator())` and the arena owns the slice for free.

The cascading consequence of `init.io`, though, was the real test: every dep that does any kind of I/O — networking, locks, sleep, filesystem — now needs an `Io` context threaded through it. That's how I discovered `pg.zig` had a freshly-merged 0.16.0 PR I needed to chase (Karl was on it). `std.Thread.sleep` was gone too, so `retry.zig` learned to call `std.Io.Clock.Duration.sleep(io)` instead. The whole codebase started feeling more *intentional* about who owns what.

## Smoke test

After troubleshooting some Docker troubles[^2], I got the local environment healthy and started smoke-testing ishi end-to-end:

```sh
$ ./zig-out/bin/ishi init
initialized for model 'ai/nomic-embed-text-v1.5' (768 dims)

$ ./zig-out/bin/ishi seed --git --limit 5
info(seed): Walking up to 5 commits...
info(seed): Found 5 commits, seeding...
info(seed): embedding 0df192bf...
info(seed):   seeded 0df192bf...
...

$ ./zig-out/bin/ishi query "what changed about the build system?"
querying: "what changed about the build system?"

1. (0.5478) 0df192bf... build: Guard against wrong Zig version with requirez
```

The top hit was the very commit that added a `requirez("0.16.0")` comptime guard to `build.zig`. ishi reading its own upgrade history back to me felt like a nice payoff. We're back in business.

## Resources

- [Zig 0.16.0 release notes][zig-016] — especially the [Juicy Main][juicy-main] section
- My toy [hash][hash] repo where I test-drove the new main signature
- [PR #29][pr] with the full upgrade diff
- [docs/WRITERGATE.md](https://github.com/louislef299/ishi/blob/main/docs/WRITERGATE.md) — earlier notes on what writergate actually broke

[^1]: 0.16.0 final shipped late January 2026 after a long writergate-driven dev cycle. If you're upgrading, the [release notes][zig-016] are mandatory reading — there's a lot of API churn, but most of it is mechanical.

[^2]: That story deserves its own post. Short version: alpine's apk `zig` predates 0.16.0; `alpine:edge`'s apk `zig` *says* 0.16.0 but ships a mismatched stdlib; I ended up with `apk add go` → `go install zvm` → `zvm install 0.16.0` inside the Dockerfile, which feels cursed but works.

[ishi]: https://github.com/louislef299/ishi
[zig-016]: https://ziglang.org/download/0.16.0/release-notes.html
[juicy-main]: https://ziglang.org/download/0.16.0/release-notes.html#Juicy-Main
[hash]: https://github.com/louislef299/hash
[pr]: https://github.com/louislef299/ishi/pull/29
[swiss tables]: https://philpearl.github.io/post/swissing_a_table/

<div style="opacity: 0.55; font-size: 0.85em; font-style: italic; margin-top: 3em; border-top: 1px solid currentColor; padding-top: 1em;">
This post and the underlying upgrade were aided by Claude Opus 4.7.
</div>
