---
title: "Git Model Zig"
date: 2026-03-11T09:14:39-05:00
draft: false
toc: true
tags:
- zig
- git
---

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
project already requires Docker & Ollama as a system dependency anyways).

1. Add libgit2 as a dependency in build.zig.zon
   - Option A: Use a Zig package that wraps libgit2 (e.g., zig-libgit2 or andrewrk/libgit2)
   - Option B: Link system-installed libgit2 (brew install libgit2)
2. Update build.zig to link libgit2
   - exe.linkSystemLibrary("git2")
   - exe.linkLibC()
   - (If vendored: add the dependency module import instead)

## Read a Git Commit

3. Create a new source file: src/lib/git.zig
   - Import libgit2 C headers via @cImport(@cInclude("git2.h"))
   - Define a CommitInfo struct to hold the extracted data:
       {
         sha: [40]u8,
         author_name: []const u8,
         author_email: []const u8,
         author_date: i64,
         committer_name: []const u8,
         committer_email: []const u8,
         committer_date: i64,
         message: []const u8,
         diff_patch: []const u8,   // full patch text
         files_changed: u32,
         insertions: u32,
         deletions: u32,
       }
4. Write a readHeadCommit(repo_path: []const u8) function:
   4a. Initialize libgit2 runtime
       - call git_libgit2_init()
       - defer git_libgit2_shutdown()
   4b. Open the repository
       - call git_repository_open(&repo, repo_path)
       - defer git_repository_free(repo)
   4c. Resolve HEAD to an OID
       - call git_reference_name_to_id(&oid, repo, "HEAD")
   4d. Look up the commit object
       - call git_commit_lookup(&commit, repo, &oid)
       - defer git_commit_free(commit)
   4e. Extract commit metadata
       - sha       = git_oid_tostr_s(&oid)
       - author    = git_commit_author(commit)      → .name, .email, .when.time
       - committer = git_commit_committer(commit)    → .name, .email, .when.time
       - message   = git_commit_message(commit)
   4f. Get the commit's tree
       - call git_commit_tree(&tree, commit)
       - defer git_tree_free(tree)
   4g. Get the parent's tree (if parent exists)
       - if git_commit_parentcount(commit) > 0:
           - call git_commit_parent(&parent, commit, 0)
           - call git_commit_tree(&parent_tree, parent)
           - defer git_tree_free(parent_tree)
           - defer git_commit_free(parent)
       - else:
           - parent_tree = null  (root commit, diff against empty tree)
   4h. Compute the diff between parent tree and commit tree
       - call git_diff_tree_to_tree(&diff, repo, parent_tree, tree, null)
       - defer git_diff_free(diff)
   4i. Extract diff stats
       - call git_diff_get_stats(&stats, diff)
       - defer git_diff_stats_free(stats)
       - files_changed = git_diff_stats_files_changed(stats)
       - insertions    = git_diff_stats_insertions(stats)
       - deletions     = git_diff_stats_deletions(stats)
   4j. Extract full patch text
       - call git_diff_to_buf(&buf, diff, GIT_DIFF_FORMAT_PATCH)
       - defer git_buf_dispose(&buf)
       - copy buf.ptr[0..buf.size] into a Zig-owned slice
   4k. Populate and return the CommitInfo struct

## Test It Out!

5. Wire it into ishi's command system
   - Add a new subcommand (e.g., "read" or extend "seed")
   - Call readHeadCommit(".") or readHeadCommit(user_provided_path)
   - Print or serialize the CommitInfo to verify correctness
6. Error handling throughout
   - Every libgit2 call returns an int (0 = success, <0 = error)
   - On failure: call git_error_last() to get the error message
   - Translate to Zig error union: return error.GitError

[ishi]: https://github.com/louislef299/ishi
[libgit2]: https://libgit2.org/
[libgit2 is a different beast]: https://libgit2.org/docs/guides/build-and-link/
[object]: https://git-scm.com/docs/gitdatamodel#objects
[rmt]: https://github.com/louislef299/rmt
[Zig FFI]: https://zighelp.org/chapter-4/
