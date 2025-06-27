---
title: "Notarize aws-sso"
date: 2025-06-26T16:20:26-05:00
draft: false
---

So, it's finally time to shine off my [aws-sso][] custom cli
tool. Initially, it was written to only be developed for myself, and I
had mostly just been maintaining dependencies and not actually
developing any new features. The last release I had actually developed
a feature on was [v1.4.0][], which was mostly about persisting
information about different accounts so that I wouldn't have to pass
flags every time I ran a command.

For those of you who don't want to read a shitty README and aren't
able to get a personal 1:1 video with me, the skinny of the tool is
that I disliked the way AWS had setup their `aws sso login` as I
thought it was not intuitive and led to people re-authing and sort of
fumbling around with it. Not only was that piece annoying, it wouldn't
automatically authenticate you to ECR or EKS, which I was constantly
doing as a young kubernetes administrator across many environments, so
I wrote a tool that worked in a more idiomatic way and automated the
container registry and cluster authentication as well.

Well for one of my first cli tools that I wrote only 1 year into my
professional career, it wasn't bad! Looking back on some of the
programming choices I made, it isn't as modular as I would prefer, but
it generally works. Every once in a while I need to pass a `--refresh`
flag, but otherwise it works fine.

My problems started when I was forced to update my GoReleaser
configuration a [start publishing my brew config as a Cask][PR#480].

## Apple Gatekeeper

With the switch to Casks, artifacts need to be notarized. This
essentially left me with two options:

- Spend $99 a year on an [Apple Developer Account][]
- Hack my way through the problem

Since I don't yet *love* the idea of giving Apple even more money just
to run software on their system, I decided to go the route of hacking
my way through with a post-install script:

<!-- markdownlint-disable MD013 -->
```yaml
homebrew_casks:
  - name: aws-sso
    hooks:
      post:
        install: |
          if system_command("/usr/bin/xattr", args: ["-h"]).exit_status == 0
            system_command "/usr/bin/xattr", args: ["-dr", "com.apple.quarantine", "#{staged_path}/aws-sso"]
          end
```
<!-- markdownlint-enable MD013 -->

Although it was annoying to deal with, it's nice to know that this runtime
protection exists. And it got me thinking that even if I don't want to pay Apple
$99/year, I should do my end users justice and notarize my binary so that they
have an increased amout of trust installing and using my software that interacts
with such sensitive information.

## GnuPG(GNU Privacy Guard)

[GnuPG][] is a free implementation of [OpenPGP][]. From [RFC4880][]:

> OpenPGP software uses a combination of strong public-key and symmetric
> cryptography to provide security services for electronic communications and
> data storage.

So essentially, perfect for my scenario. For information of how to generate a
key-pair, I'd recommend running through the [Arch Wiki docs][]. But, after
running through that process, I was able to get my public key uploaded at
[louislefebvre.net/public-key.txt](/public-key.txt).

### Quickstart GPG

This section will just go over some useful GPG tips so that I can
reference this later. It specifically signs a `doc` with a [detached
signature][] because I am mostly using GPG to sign and distribute
software.

```bash
# List keys on your public key ring
gpg --list-keys

# Export a public key to stdout(--output to write to file)
gpg --armor --export <keyID/userID>

# Check key expiration date
gpg -k <keyID>

# Detached signature on a doc with a specific key(--default-key)
gpg --default-key <keyID> --detach-sig --output doc.sig --sign doc

# Verify the signature
gpg --verify doc.sig doc
```

[Apple Developer Account]: https://developer.apple.com/
[Arch Wiki docs]: https://wiki.archlinux.org/title/GnuPG#Create_a_key_pair
[aws-sso]: https://github.com/louislef299/aws-sso
[detached signature]: https://www.gnupg.org/gph/en/manual/r622.html
[GnuPG]: https://www.gnupg.org/gph/en/manual/book1.html
[OpenPGP]: https://www.openpgp.org/about/
[PR#480]: https://github.com/louislef299/aws-sso/pull/480
[RFC4880]: https://www.ietf.org/rfc/rfc4880.txt
[v1.4.0]: https://github.com/louislef299/aws-sso/releases/tag/v1.4.0
