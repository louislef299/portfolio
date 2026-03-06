---
title: "Brew Maintenance Tips"
date: 2026-03-05T19:27:13-06:00
draft: false
tags:
- brew
- macos
- secops
---

[Homebrew][] is an excellent package manager for macOS and even Linux, so I'm
going to take a deep-dive today and give a high-level overview of hombrew from
the perspective of a sysadmin. I've worked with a lot of engineers who
understand `brew install`, but haven't taken the time to understand how to
maintain your installed packages with `brew`. This post covers day-to-day usage,
how to write your own packages, and how to use Homebrew responsibly — especially
on shared or organizational machines where supply-chain risk is a real concern.

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

## Security Best Practices

Homebrew installs arbitrary code from the internet — that's the deal. But
unlike most package managers, Homebrew [refuses to run under sudo][]. The
entire prefix (`/opt/homebrew` on Apple Silicon) is owned by your user, and
`brew` will error out if you try to run it as root. This is an intentional
design choice: it limits blast radius by keeping everything in userspace.
That's a good baseline, but there's more you can do.

### Know What You're Installing

Before you install something unfamiliar, read the definition:

```sh
# print the formula/cask source to stdout
$ brew cat ripgrep

# or open it in $EDITOR if you want to poke around
$ brew edit ripgrep
```

For formulae, the interesting bits are the `url`, `sha256`, and the `install`
block — that's the code that actually runs on your machine. For casks, pay
attention to the `sha256` and the `url` pointing at the vendor binary.

Formulae from `homebrew/core` ship as [bottles][] by default — precompiled
binaries built by [BrewTestBot][] on Homebrew's own CI infrastructure. Each
bottle has a per-platform SHA-256 checksum baked into the formula definition,
so you're getting a reproducible artifact rather than building from an
arbitrary source tarball. If a bottle isn't available for your platform,
Homebrew falls back to building from source.

Casks don't have the same CI story — they pull vendor binaries directly. You
can enforce checksum verification for casks globally:

```sh
# require a sha256 checksum for every cask install
$ export HOMEBREW_CASK_OPTS="--require-sha"

# or pass it per-command
$ brew install --cask --require-sha some-app
```

If a cask doesn't declare a `sha256`, the install will fail. This is a good
way to catch casks that use `sha256 :no_check` (which means "trust the
download URL blindly").

### Auditing What's on Your Machine

```sh
# what's outdated (and potentially carrying known CVEs)
$ brew outdated

# what depends on a given formula
$ brew uses --installed openssl

# what taps are currently active
$ brew tap
```

A quick note on `brew audit`: it's a linting tool for formula/cask
*contributors*, not an end-user security scanner. It checks style rules and
packaging conventions. Useful if you're writing or reviewing a formula, but
it won't tell you if something installed on your machine is compromised.

### Tap Hygiene

Every `brew tap` is a Git repo whose maintainers can deliver arbitrary Ruby
code to your machine. Treat tapping like adding a third-party package
registry — vet the repo, check who maintains it, and untap anything you're
no longer using:

```sh
$ brew untap some-org/some-tap
```

You can restrict which taps are allowed on your machine entirely with the
`HOMEBREW_ALLOWED_TAPS` environment variable:

```sh
# only allow homebrew-core and one internal tap
export HOMEBREW_ALLOWED_TAPS="homebrew/core myorg/internal-tools"
```

With this set, any `brew tap` or `brew install` from a tap not on the list
will be refused. This is especially useful on managed machines where you want
to prevent drive-by tapping.

### Reproducibility with Brewfile

A [Brewfile][] is a declarative manifest of what should be installed — taps,
formulae, casks, and even Mac App Store apps. It is *not* a lockfile (Homebrew
has no lockfile concept), so it won't pin you to exact versions. What it gives
you is a reproducible baseline:

```ruby
# Brewfile
tap "homebrew/bundle"
tap "myorg/internal-tools"

brew "git"
brew "jq"
brew "ripgrep"
cask "firefox"

# enforce checksum verification for all casks in this Brewfile
cask_args require_sha: true
```

```sh
# generate a Brewfile from your current install state
$ brew bundle dump

# install everything declared in the Brewfile
$ brew bundle install

# check for drift
$ brew bundle check

# remove anything installed that ISN'T in the Brewfile
$ brew bundle cleanup --force
```

`brew bundle cleanup --force` is the one people miss — it uninstalls anything
on your machine that isn't declared in the Brewfile. Combined with
`brew bundle check`, you get a tight feedback loop: the Brewfile is the source
of truth, and drift gets caught or corrected.

Committing a Brewfile to a dotfiles repo makes new machine setup reproducible
and auditable.

### CI and Automation

Homebrew in CI is a different beast. By default, `brew install` triggers
`brew update` first, which means your CI run can get different formula
versions than the last run. Two environment variables to know:

```sh
# skip the auto-update before install/upgrade
export HOMEBREW_NO_AUTO_UPDATE=1

# force fetching formulae from tapped repos instead of the JSON API
# (useful if you need to pin to a specific tap commit)
export HOMEBREW_NO_INSTALL_FROM_API=1
```

`HOMEBREW_NO_AUTO_UPDATE=1` is the big one — without it, your CI builds are
non-deterministic. `HOMEBREW_NO_INSTALL_FROM_API=1` is more niche but
relevant if you're doing something like pinning a tap to a specific Git ref.

Pair these with a checked-in Brewfile and `brew bundle install` in your CI
setup step, and you get a predictable, auditable set of tools for every run.

## Conclusion

Homebrew is a tool most of us use daily without thinking much about it. The
basics — `brew update`, `brew upgrade`, `brew cleanup` — go a long way. But
once you understand the distinction between formulae and casks, keep your taps
clean, enforce checksums on cask installs, and maintain a Brewfile as your
source of truth, you're in a much stronger position. Especially in CI, where
reproducibility matters, a few environment variables make the difference
between "works on my machine" and "works every time."

[bottles]: https://docs.brew.sh/Bottles
[BrewTestBot]: https://docs.brew.sh/Brew-Test-Bot
[Brewfile]: https://github.com/Homebrew/homebrew-bundle
[brew man page]: https://docs.brew.sh/Manpage
[Cask Cookbook]: https://docs.brew.sh/Cask-Cookbook
[Formula Cookbook]: https://docs.brew.sh/Formula-Cookbook
[`homebrew/core`]: https://github.com/Homebrew/homebrew-core
[Homebrew]: https://brew.sh/
[refuses to run under sudo]: https://docs.brew.sh/FAQ#why-does-homebrew-say-sudo-is-bad
