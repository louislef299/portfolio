---
title: "Brew Maintenance Tips"
date: 2026-03-01T19:27:13-06:00
draft: false
tags:
- homebrew
- macos
- security
---

[Homebrew][] is an excellent package manager for macOS and even Linux, so I'm
going to take a deep-dive today and give a high-level overview of hombreew from
the perspective of a sysadmin. I've worked with a lot of engineers who
understand `brew install`, but haven't taken the time to understand how to
maintain your installed packages with `brew`.

One important command to have in your arsenal is `brew doctor`. It is worth
running regularly — it catches stale symlinks, PATH issues, and other common
gotchas. Good to note: Warnings can safely be ignored from the output. For
example, the following warns me that some packages are disabled, so I should
figure out where the new remote location is:

```sh
$ brew doctor
Please note that these warnings are just used to help the Homebrew maintainers
with debugging if you file an issue. If everything you use Homebrew for is
working fine: please don't worry or file an issue; just ignore this. Thanks!

Warning: Some installed casks are deprecated or disabled.
You should find replacements for the following casks:
  powershell

Warning: Some installed formulae are deprecated or disabled.
You should find replacements for the following formulae:
  neofetch
  terraform
```

`brew doctor` is worth running regularly — it catches stale symlinks, PATH
issues, and other common gotchas. It's also a good habit to run `brew update &&
brew upgrade && brew cleanup` on a regular cadence so your tools stay current
and your disk doesn't fill up with stale artifacts.

## Casks? Formulae?? Packages???

> Formula: Homebrew package definition that builds from upstream sources.
>
> Cask: Homebrew package definition that installs pre-compiled binaries built
> and signed by upstream.
>
> *[Brew Man Page][]*

This is why I still just call all the targets `brew` manages *packages*.
Homebrew uses Git for storing formulae & cask definitions. It installs formula
packages to the *Cellar*(`brew --cellar`) and then symlinks them into the
*prefix* (`brew --prefix`), while casks are stored in the *Caskroom* and linked
or placed into appropriate locations depending on the artifact type (e.g.
`/Applications`). The *Cellar* is a local filesystem directory for installed
software.

```sh
# Example info for a Formula(go)
$ brew info go
==> go ✔: stable 1.26.0 (bottled), HEAD
Open source programming language to build simple/reliable/efficient software
https://go.dev/
Installed
/opt/homebrew/Cellar/go/1.26.0 (14,925 files, 228.4MB) *
  Poured from bottle using the formulae.brew.sh API on 2026-02-13 at 10:21:30
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/g/go.rb
License: BSD-3-Clause
==> Requirements
Required: macOS >= 12 (or Linux) ✔
==> Options
--HEAD
        Install HEAD version
==> Downloading https://formulae.brew.sh/api/formula/go.json
==> Analytics
install: 202,189 (30 days), 444,567 (90 days), 1,406,114 (365 days)
install-on-request: 164,448 (30 days), 352,537 (90 days), 1,098,571 (365 days)
build-error: 833 (30 days)

# Example info for a Cask(aws-sso)
$ brew info aws-sso
==> aws-sso ✔: 1.6.22
https://github.com/louislef299/aws-sso
Installed
/opt/homebrew/Caskroom/aws-sso/1.6.22 (40.2MB)
  Installed on 2025-11-20 at 09:39:22
From: https://github.com/louislef299/homebrew-aws-sso/blob/HEAD/Casks/aws-sso.rb
==> Name
aws-sso
==> Description
Thanks for installing aws-sso! You can get configured by going to 
https://aws-sso.netlify.app. The binary you have installed came with a binary 
signature if you would like to verify the install. More information can be 
found on the website
==> Artifacts
aws-sso (Binary)
```

This post won't go over how to create *Formulae* or *Casks*, but you can
reference the [Formula Cookbook][] and [Cask Cookbook][] to get started. It is
important to mention that these Formula/Cask definitions are just ruby scripts
hosted by a *Tap*. If you'd like to view what these definitions look like, you
can run `brew cat go` to view th `go` Formula and `brew cat --cask aws-sso` to
view the `aws-sso` Cask.

## What's A Tap?

> tap: Directory (and usually Git repository) of formulae, casks and/or external
> commands. By default, taps are repositories that are assumed to come from
> GitHub, but isn’t limited to any one location.
>
> *[Brew Man Page][]*

So, a tap is a location(remote or local) that contains the required *Formula* or
*Cask*. The default *Tap* that `brew` uses is [`homebrew/core`][] and any
additional *Taps* must be integrated with `brew tap`. It's important to note
here you should only `tap` trusted vendors since tapping gives the repo
maintainers the ability to deliver code to your machine.

To fully understand tapping, I think it's best to demo an example for `aws-sso`:

```sh
# First, notice that brew can't find aws-sso by default since it's not in homebrew/core
$ brew search aws-sso
==> Formulae
aws-sso-cli     aws-sso-util

# So, let's tap my repository that hosts my aws-sso Cask
$ brew tap louislef299/aws-sso
==> Tapping louislef299/aws-sso
Cloning into '/opt/homebrew/Library/Taps/louislef299/homebrew-aws-sso'...
remote: Enumerating objects: 311, done.
remote: Counting objects: 100% (159/159), done.
remote: Compressing objects: 100% (122/122), done.
remote: Total 311 (delta 63), reused 3 (delta 1), pack-reused 152 (from 2)
Receiving objects: 100% (311/311), 51.66 KiB | 10.33 MiB/s, done.
Resolving deltas: 100% (158/158), done.
Tapped 1 cask (15 files, 70.3KB).

# Now, aws-sso is discoverable and can be installed
$ brew search aws-sso         
==> Formulae
aws-sso-cli     aws-sso-util

==> Casks
louislef299/aws-sso/aws-sso

$ brew install aws-sso
==> Fetching downloads for: louislef299/aws-sso/aws-sso
✔︎ Cask aws-sso (1.6.22)     Verified     12.9MB/ 12.9MB
==> Installing Cask aws-sso
==> Linking Binary 'aws-sso' to '/opt/homebrew/bin/aws-sso'
🍺  aws-sso was successfully installed!

# Optionally untap repositories you no longer want
# (need to uninstall related packages first)
$ brew uninstall aws-sso && brew untap louislef299/aws-sso
==> Uninstalling Cask aws-sso
==> Unlinking Binary '/opt/homebrew/bin/aws-sso'
==> Purging files for version 1.6.22 of Cask aws-sso
Untapping louislef299/aws-sso...
Untapped 1 cask (15 files, 70.3KB).
```

Note: Below is all slop-generated

---

<!-- EDITOR NOTE (Zed): Alt+Q hard-wraps the current paragraph at the column
     defined by "preferred_line_length" in ~/.config/zed/settings.json. Set
     it to 80 and you're good. No extension needed — built-in since v0.154.0.
     Known quirk: blockquote rewrapping has a bug (loses `>` delimiters). -->

[Homebrew][] is the de facto package manager for macOS. If you've ever
installed a CLI tool on a Mac, there's a good chance you used it. This post
covers day-to-day usage, how to write your own packages, and how to use
Homebrew responsibly — especially on shared or organizational machines where
supply-chain risk is a real concern.

## Security Best Practices

`brew audit`?

This is where it gets interesting. Homebrew installs arbitrary code from the
internet, often with elevated privileges. Here's how to keep that under
control.

### Understand What You're Installing

Before installing anything, read the formula:

```bash
# open the formula source in your editor
$ brew edit ripgrep

# or just cat it
$ brew cat ripgrep
```

For casks, pay attention to the `sha256` — Homebrew verifies the download
against it before installing.

### Auditing What's on Your Machine

```bash
# check for outdated packages (potential CVE exposure)
$ brew outdated

# show which packages depend on a given formula
$ brew uses --installed openssl

# look for anything suspicious in your taps
$ brew tap
```

### Locking Versions with Brewfile

A [Brewfile][] is the Homebrew equivalent of a lockfile. It declaratively
describes exactly what should be installed:

```ruby
# Brewfile
tap "homebrew/bundle"

brew "git"
brew "jq"
brew "ripgrep"
cask "firefox"
```

```bash
# generate a Brewfile from your current install state
$ brew bundle dump

# install everything in a Brewfile
$ brew bundle install

# check for drift between Brewfile and actual install state
$ brew bundle check
```

Committing a Brewfile to a dotfiles repo is a great way to make new machine
setup reproducible and auditable.

## Multi-User Systems and Organizations

On a shared machine or in an org environment, a few things change.

### Permissions and Prefix Ownership

Homebrew's default install location (`/opt/homebrew` on Apple Silicon) is
owned by a single user. On a multi-user machine, consider installing into a
location accessible to a shared group, or use a per-user prefix:

```bash
# install into a user-local prefix (no sudo required)
HOMEBREW_PREFIX="$HOME/.homebrew" \
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Supply Chain Risk

Homebrew pulls formula definitions from GitHub and fetches binaries from
upstream sources. A compromised tap or a hijacked upstream URL is a real
attack vector. Mitigations:

- **Pin to known-good versions** — `brew pin <formula>` prevents automatic
  upgrades.

  ```bash
  $ brew pin openssl
  $ brew list --pinned
  ```

- **Prefer bottles over building from source** — prebuilt bottles are built
  by Homebrew's own CI and are more reproducible than pulling arbitrary source.
- **Audit taps before trusting them** — treat a `brew tap` like adding a
  third-party package registry. Read the repo, check the maintainers.
- **Use `HOMEBREW_NO_AUTO_UPDATE=1`** in CI pipelines to prevent unexpected
  formula changes between runs.
- **`brew audit`** runs a set of linting checks against a formula — useful
  if you're reviewing an unfamiliar one.

### Distributing a Brewfile in an Organization

For orgs managing developer machines at scale, a shared Brewfile in a
company dotfiles repo (combined with an MDM like Jamf or a tool like
[Ansible][]) gives you a declarative, auditable baseline for what's installed
on every machine.

## Conclusion

Homebrew is a powerful tool that's easy to take for granted. Used thoughtfully
— with a Brewfile, regular audits, and careful tap hygiene — it scales well
from a single personal machine to a fleet of developer workstations.

[Ansible]: https://www.ansible.com/
[Brewfile]: https://github.com/Homebrew/homebrew-bundle
[brew man page]: https://docs.brew.sh/Manpage
[Cask Cookbook]: https://docs.brew.sh/Cask-Cookbook
[Formula Cookbook]: https://docs.brew.sh/Formula-Cookbook
[`homebrew/core`]: https://github.com/Homebrew/homebrew-core
[Homebrew]: https://brew.sh/
