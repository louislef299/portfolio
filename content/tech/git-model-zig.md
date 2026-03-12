---
title: "Git Model Zig"
date: 2026-03-11T09:14:39-05:00
draft: false
toc: true
tags:
- zig
- git
---

opencode -s ses_32273be62ffep570bG7WQZoiho

Today I'm experimenting with Zig integrations and Git. Essentially, I want to
gather Git commit([object][]) information leveraging Zig without using the Git
cli. With the Git cli, this would be `git log -1` or with the plumbing command
`git cat-file -p $(cat .git/ORIG_HEAD)`. This is required for my [ishi][]
project as I'm going to start seeding my pgvector database with commit data.

To keep it simple, I'm going to leverage [Zig FFI][] and [libgit2][] and just
read the latest commit defined by `.git/ORIG_HEAD`. From a high level, the steps
I'll follow are:

1. Add libgit2 as a dependency in build.zig.zon
1. Update build.zig to link libgit2
1. Create a new source file: src/lib/git.zig
1. Write a readHeadCommit(repo_path: []const u8) function
1. Wire it into ishi's command system(plumbing cmd)

Easy, right? It never is, so let's give it a try.

Open Questions Before Implementation

1. libgit2 packaging -- Do you want to vendor libgit2 via Zig's package manager
   (hermetic build, no system dependency) or link against a system-installed
   libgit2? The vendored approach is more portable but adds build complexity.
2. Diff output format -- GIT_DIFF_FORMAT_PATCH gives full unified diff. For
   embedding purposes, you might prefer GIT_DIFF_FORMAT_PATCH_HEADER (just file
   names + stats) or a custom summary. Which is better for your nomic-embed-text
   context window?
3. Memory ownership -- libgit2 objects are C-allocated. The plan assumes copying
   strings into Zig-owned allocator memory before freeing the libgit2 objects.
   Should CommitInfo use an ArenaAllocator for simplicity?

## Integrate libgit2 into Zig Build

One of the first considerations is how to package libgit2 with the Zig build
system. In [rmt][], I had a small regex C dependency that I was able to link to
directly in my `build.zig` with a small function defintion:

```c
fn linkSLRE(b: *std.Build, exe: *std.Build.Step.Compile) void {
    // path of the slre submodule
    exe.addIncludePath(b.path("slre"));

    // entire dependency existed in a single file, simplifying the link process
    exe.addCSourceFile(.{ .file = b.path("slre/slre.c") });
    exe.linkLibC();
}
```

However, [libgit2 is a different beast][]. From transitive dependencies,
specific and platform-specific CMake build-time configurations, and increased
Zig build times, it will be easiest to link to a system-installed libgit2(the
project already requires Docker & Ollama as system dependencies anyways).

Assuming the dependency is installed on the system actually makes my life
easier, and all that's required to add to my `build.zig` is:

```c
exe.linkSystemLibrary("git2");
exe.linkLibC();
```

One gotcha that I ran into is the UNIX linking standard. I initially linked the
system library under the name `libgit2` and ran into a linker error when trying
to build. I guess UNIX standard is to automatically prepend `lib` to the name
when searching for the file(`man ld`), which results in an error like:

```sh
$ zig build
install
└─ install ishi
   └─ compile exe ishi Debug native failure
error: error: unable to find dynamic system library 'libgit2' using strategy 'paths_first'. searched paths:
  /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib/liblibgit2.tbd
  /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib/liblibgit2.dylib
  /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib/liblibgit2.so
  /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib/liblibgit2.a
  /opt/homebrew/lib/liblibgit2.tbd
  /opt/homebrew/lib/liblibgit2.dylib
  /opt/homebrew/lib/liblibgit2.so
  /opt/homebrew/lib/liblibgit2.a
```

## Read a Git Commit

With libgit2 linked, the next step is to actually use it. I created
`src/lib/git.zig` and pulled in the C headers with a single line:

```zig
const lg2 = @cImport(@cInclude("git2.h"));
```

That `@cImport` is doing a lot of heavy lifting -- Zig's compiler parses the
libgit2 C headers at build time and translates every C type, function, enum, and
macro into Zig declarations. After this line, every libgit2 function is
available under the `lg2` namespace: `lg2.git_repository_open`,
`lg2.git_commit_lookup`, `lg2.GIT_DIFF_FORMAT_PATCH`, etc. No manual bindings
needed.

### The Opaque Pointer Pattern

Before diving into the implementation, it's worth understanding libgit2's
calling convention, because it tripped me up immediately. libgit2 uses
[opaque pointer types][] with an out-parameter pattern. You never construct a
`git_repository` yourself -- you declare a nullable pointer and pass its
_address_ to a function that fills it in:

```zig
var repo: ?*lg2.git_repository = null;
try check(lg2.git_repository_open(&repo, repo_path));
defer lg2.git_repository_free(repo);
```

My first attempt was `lg2.git_repository{}` -- trying to default-initialize the
struct like you would in Zig. That doesn't work because `git_repository` is
opaque (an incomplete type in C). The library allocates the real struct
internally and hands you back a pointer through the out-parameter. Every
libgit2 object follows this pattern: repositories, commits, diffs, trees, etc
and if you've ever worked with low-level syscalls, this is similar to how
sockets are leveraged.

### Error Handling: check()

Every libgit2 function returns a C `int` where `0` means success and negative
values are errors. Rather than check this inline everywhere, I wrote a small
helper to translate that into Zig's error union system:

```zig
fn check(code: c_int) !void {
    if (code < 0) {
        return error.Lg2Error;
    }
}
```

This lets me use `try check(...)` on every call, and Zig's `errdefer` machinery
handles cleanup automatically if anything fails partway through.

### Memory Ownership: C Strings to Zig Slices

libgit2 returns C strings (`const char *`) that are owned by the library -- they
become dangling pointers once the parent object is freed. Since I want
`CommitInfo` to outlive the libgit2 objects, I need to copy every string into
Zig-managed memory. I wrote a helper for that too:

```zig
fn dupeString(allocator: std.mem.Allocator, c_str: ?[*:0]const u8) ![]const u8 {
    const s = c_str orelse return allocator.dupe(u8, "");
    return allocator.dupe(u8, std.mem.span(s));
}
```

`std.mem.span` converts a null-terminated `[*:0]const u8` (C string) into a
bounded `[]const u8` (Zig slice) by scanning for the sentinel. Then
`allocator.dupe` copies it. If the C pointer is null (which can happen -- e.g.,
a commit with no author set), it returns an empty string instead of crashing.

### CommitInfo Struct

The output of `readHeadCommit` is a `CommitInfo` struct that owns all its string
data. The caller must call `deinit()` when done:

```zig
pub const CommitInfo = struct {
    sha: [40]u8,
    author_name: []const u8,
    author_email: []const u8,
    author_date: i64,
    committer_name: []const u8,
    committer_email: []const u8,
    committer_date: i64,
    message: []const u8,
    diff_patch: []const u8,
    files_changed: usize,
    insertions: usize,
    deletions: usize,

    allocator: std.mem.Allocator,

    pub fn deinit(self: *CommitInfo) void {
        self.allocator.free(self.author_name);
        self.allocator.free(self.author_email);
        self.allocator.free(self.committer_name);
        self.allocator.free(self.committer_email);
        self.allocator.free(self.message);
        self.allocator.free(self.diff_patch);
    }
};
```

Storing the `allocator` inside the struct is a common Zig pattern -- it ensures
`deinit()` uses the same allocator that created the data, so there's no
mismatch. The SHA is a fixed `[40]u8` rather than a heap slice because it's
always exactly 40 hex characters.

### Walking Through readHeadCommit

The function signature accepts an `std.mem.Allocator` and a null-terminated path
(`[*:0]const u8`) since libgit2's C functions expect C strings:

```zig
pub fn readHeadCommit(allocator: std.mem.Allocator, repo_path: [*:0]const u8) !CommitInfo {
```

**Initialize and open.** libgit2 requires a one-time global init call. The
`defer` ensures shutdown runs even if something errors out later:

```zig
_ = lg2.git_libgit2_init();
defer _ = lg2.git_libgit2_shutdown();

var repo: ?*lg2.git_repository = null;
try check(lg2.git_repository_open(&repo, repo_path));
defer lg2.git_repository_free(repo);
```

**Resolve HEAD to an OID.** Rather than manually reading `.git/HEAD` and
following the symref chain, [`git_reference_name_to_id`][git_reference_name_to_id]
does it in one call -- it resolves `"HEAD"` all the way to a concrete commit
OID:

```zig
var oid: lg2.git_oid = undefined;
try check(lg2.git_reference_name_to_id(&oid, repo, "HEAD"));
```

**Look up the commit.** With the OID in hand, [`git_commit_lookup`][git_commit_lookup]
fetches the full commit object:

```zig
var commit: ?*lg2.git_commit = null;
try check(lg2.git_commit_lookup(&commit, repo, &oid));
defer lg2.git_commit_free(commit);
```

**Extract metadata.** The SHA needs special treatment.
[`git_oid_tostr_s`][git_oid_tostr_s] returns a pointer to a thread-local static
buffer inside libgit2, so it must be copied immediately before any other
libgit2 call might overwrite it:

```zig
var sha: [40]u8 = undefined;
const sha_str = lg2.git_oid_tostr_s(&oid);
if (sha_str) |s| {
    @memcpy(&sha, s[0..40]);
} else {
    @memset(&sha, '0');
}
```

Author and committer data comes from [`git_commit_author`][git_commit_author]
and [`git_commit_committer`][git_commit_committer], which return pointers to
[`git_signature`][git_signature] structs with `.name`, `.email`, and `.when.time`
fields. Each string gets duped into Zig memory, and each dupe gets an `errdefer`
so the allocations unwind correctly if a later step fails:

```zig
const author = lg2.git_commit_author(commit);
const author_name = try dupeString(allocator, if (author) |a| a.*.name else null);
errdefer allocator.free(author_name);

const author_email = try dupeString(allocator, if (author) |a| a.*.email else null);
errdefer allocator.free(author_email);

const author_date: i64 = if (author) |a| a.*.when.time else 0;
```

The commit message works the same way via [`git_commit_message`][git_commit_message]:

```zig
const message = try dupeString(allocator, lg2.git_commit_message(commit));
errdefer allocator.free(message);
```

### Computing the Diff

This is the most involved part. To get a diff, you need _two_ trees: the
commit's tree and its parent's tree. git compares the two to produce the
changeset.

**Get the commit's tree.** [`git_commit_tree`][git_commit_tree] extracts the
tree object that the commit points to:

```zig
var tree: ?*lg2.git_tree = null;
try check(lg2.git_commit_tree(&tree, commit));
defer lg2.git_tree_free(tree);
```

**Get the parent's tree.** A commit can have zero parents (root commit), one
parent (normal commit), or multiple (merge commit). For the root commit case,
passing `null` as the old tree tells libgit2 to diff against an empty tree --
effectively treating the entire commit as additions:

```zig
var parent_tree: ?*lg2.git_tree = null;
if (lg2.git_commit_parentcount(commit) > 0) {
    var parent: ?*lg2.git_commit = null;
    try check(lg2.git_commit_parent(&parent, commit, 0));
    defer lg2.git_commit_free(parent);
    try check(lg2.git_commit_tree(&parent_tree, parent));
}
defer if (parent_tree) |pt| lg2.git_tree_free(pt);
```

That last `defer` is worth noting -- it uses Zig's payload capture to only call
`git_tree_free` if `parent_tree` is non-null. No `if` guard needed at cleanup
time.

**Compute the diff.** [`git_diff_tree_to_tree`][git_diff_tree_to_tree] compares
the parent tree to the commit tree. The final `null` argument means "use default
diff options":

```zig
var diff: ?*lg2.git_diff = null;
try check(lg2.git_diff_tree_to_tree(&diff, repo, parent_tree, tree, null));
defer lg2.git_diff_free(diff);
```

**Extract diff stats.** [`git_diff_get_stats`][git_diff_get_stats] gives us
the same numbers you see in `git log --stat` -- files changed, lines added,
lines removed:

```zig
var stats: ?*lg2.git_diff_stats = null;
try check(lg2.git_diff_get_stats(&stats, diff));
defer lg2.git_diff_stats_free(stats);

const files_changed = lg2.git_diff_stats_files_changed(stats);
const insertions = lg2.git_diff_stats_insertions(stats);
const deletions = lg2.git_diff_stats_deletions(stats);
```

**Extract the full patch text.** [`git_diff_to_buf`][git_diff_to_buf] serializes
the entire diff into a `git_buf` as a unified patch (the same format as
`git diff`). The buffer's memory is owned by libgit2, so I copy it into a
Zig-owned slice and then let `git_buf_dispose` clean up the C side:

```zig
var diff_buf: lg2.git_buf = .{ .ptr = null, .reserved = 0, .size = 0 };
try check(lg2.git_diff_to_buf(&diff_buf, diff, lg2.GIT_DIFF_FORMAT_PATCH));
defer lg2.git_buf_dispose(&diff_buf);

const diff_patch = if (diff_buf.ptr) |ptr|
    try allocator.dupe(u8, ptr[0..diff_buf.size])
else
    try allocator.dupe(u8, "");
errdefer allocator.free(diff_patch);
```

One thing that tripped me up briefly: the `git_buf` struct fields are `.ptr`,
`.size`, and `.reserved`. Older libgit2 versions used `.asize` instead of
`.reserved` -- if you're reading old Stack Overflow answers or pre-1.x docs,
keep that in mind.

Finally, all the fields are assembled into a `CommitInfo` and returned. Zig's
`errdefer` chain means that if _any_ allocation or libgit2 call fails along the
way, everything allocated up to that point is freed automatically. No manual
cleanup paths needed.

## Test It Out

To verify this works, I added a test block at the bottom of `git.zig` that
calls `readHeadCommit` against the current repository and validates the output:

```zig
test "readHeadCommit returns valid data for current repo" {
    const allocator = std.testing.allocator;
    var info = try readHeadCommit(allocator, ".");
    defer info.deinit();

    for (info.sha) |c| {
        try std.testing.expect(std.ascii.isHex(c));
    }

    try std.testing.expect(info.author_name.len > 0);
    try std.testing.expect(info.author_email.len > 0);
    try std.testing.expect(info.message.len > 0);
}
```

Using `std.testing.allocator` here is important -- it's a debug allocator that
panics on memory leaks. If `deinit()` misses any of the duped strings, the test
fails immediately with a leak report. Running it:

```sh
$ zig test src/lib/git.zig -lc -lgit2
1/1 git.test.readHeadCommit returns valid data for current repo...
--- readHeadCommit smoke test ---
sha:            10681c50d3e3cae32c461d86d496c52b6b7abe15
author:         Louis LeFebvre <louislefebvre1999@gmail.com>
author_date:    1773330139
committer:      Louis LeFebvre <louislefebvre1999@gmail.com>
committer_date: 1773330139
message:        feat: Integration libgit2 into build.zig
files_changed:  1
insertions:     7
deletions:      0
diff_patch len: 532 bytes
--- end ---
OK
All 1 tests passed.
```

One thing to note: `zig build test` won't discover tests in `git.zig` by
default because the test runner only traverses modules that are transitively
imported from the test root (`main.zig`). Since nothing in `main.zig` imports
`git.zig` yet, the test runner doesn't see it. To fix this, I added a
[`refAllDecls`][refAllDecls] block in `main.zig`:

```zig
const git = @import("lib/git.zig");

test {
    @import("std").testing.refAllDecls(@This());
    _ = git;
}
```

This forces the compiler to analyze `git.zig` during test builds, making its
test blocks discoverable via `zig build test`.

[git_commit_author]: https://libgit2.org/docs/reference/main/commit/git_commit_author.html
[git_commit_committer]: https://libgit2.org/docs/reference/main/commit/git_commit_committer.html
[git_commit_lookup]: https://libgit2.org/docs/reference/main/commit/git_commit_lookup.html
[git_commit_message]: https://libgit2.org/docs/reference/main/commit/git_commit_message.html
[git_commit_tree]: https://libgit2.org/docs/reference/main/commit/git_commit_tree.html
[git_diff_get_stats]: https://libgit2.org/docs/reference/main/diff/git_diff_get_stats.html
[git_diff_to_buf]: https://libgit2.org/docs/reference/main/diff/git_diff_to_buf.html
[git_diff_tree_to_tree]: https://libgit2.org/docs/reference/main/diff/git_diff_tree_to_tree.html
[git_oid_tostr_s]: https://libgit2.org/docs/reference/main/oid/git_oid_tostr_s.html
[git_reference_name_to_id]: https://libgit2.org/docs/reference/main/reference/git_reference_name_to_id.html
[git_signature]: https://libgit2.org/docs/reference/main/types/git_signature.html
[opaque pointer types]: https://en.wikipedia.org/wiki/Opaque_pointer
[refAllDecls]: https://ziglang.org/documentation/master/std/#std.testing.refAllDecls

[ishi]: https://github.com/louislef299/ishi
[libgit2]: https://libgit2.org/
[libgit2 is a different beast]: https://libgit2.org/docs/guides/build-and-link/
[object]: https://git-scm.com/docs/gitdatamodel#objects
[rmt]: https://github.com/louislef299/rmt
[Zig FFI]: https://zighelp.org/chapter-4/
