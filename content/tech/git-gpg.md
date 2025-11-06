---
title: "Git ❤️ GnuPG"
date: 2025-11-06T08:18:16-06:00
draft: false
tags:
- git
- gpg
---

<!-- markdownlint-disable MD052 -->

In a [previous post][Signing Binaries with GnuPG], I went over some of the
basics of GPG keys. Since then, I've been playing around with them a bit more
and have found them useful for [signing git commits and git tags][git sign]. The
rest of this post will assume "your work" is "your work against a git
repository".

To sign your work, you need a GPG key. If you don't have a key yet, you can
simply configure one with the defaults: `gpg --gen-key`. Now that you have it,
you can set your global git configuration setting to use this key by ID:

```bash
$ gpg --list-keys --keyid-format LONG "Louis LeFebvre" 
pub   ed25519/1ED70AB11E01B8DB 2025-11-06
uid         [ultimate] Louis LeFebvre <louislefebvre1999@gmail.com>

$ git config --global user.signingkey 1ED70AB11E01B8DB
```

Then, if I require a repository to have signed work in general, it's just a
matter of setting my local git config: `git config --local commit.gpgsign true`.
Now, I can see my commits are signed:

```bash
$ git log --show-signature -1           
commit c95ea0fb015731bee9d118ce7dc780fc8017807d (HEAD -> git-gpg)
gpg: Signature made Thu Nov  6 08:58:25 2025 CST
gpg:                using EDDSA key 1D1A36C7214DCD5441BC58721ED70AB11E01B8DB
gpg: Good signature from "Louis LeFebvre <louislefebvre1999@gmail.com>" [ultimate]
Author: Louis LeFebvre <louislefebvre1999@gmail.com>
Date:   Thu Nov 6 08:56:35 2025 -0600

    docs: Add git-gpg post
```

Instead of setting `commit.gpgsign`, you can also sign an individual commit with
the `-S` flag. This is great and all, but as you can see, my gpg key is still
unverified in my actual GitHub repository:

![GPG GitHub](/image/gpg-unverified.png)

Follow the link to add a GPG key under your user settings. Name it whatever you
like and get the public key for your GPG signing key with `gpg --armor --export
<keyID>` and copy the output. After importing the key, you should now have a
blue `Verified` tag on the commit!

<!-- markdownlint-disable MD033 MD013 -->
<div style="text-align:center;">
    <img src="/image/hackerman-mr-robot.jpg" alt="Hackerman"
        style="width:70%;height:70%;">
</div>

As you're working with GPG and git, you may also run into the following error:

```bash
gpg: signing failed: Inappropriate ioctl for device

fatal: failed to write commit object
```

This is due to GPG being unable to prompt for the key passphrase and needs to be
told what `tty` to use. The fix is to set `GPG_TTY=$(tty)`, which I just set in
my shell configuration file.

If you would like more commands related to GPG, feel free to check out this [GPG
cheatsheet][].

[git sign]: https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work
[gpg cheatsheet]: https://gock.net/blog/2020/gpg-cheat-sheet
[Signing Binaries with GnuPG]: {{< ref "/tech/notarize-aws-sso.md#quickstart-gpg" >}}
