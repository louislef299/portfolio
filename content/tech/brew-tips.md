---
title: "Brew Tips"
date: 2026-03-01T19:27:13-06:00
draft: false
tags:
- homebrew
- macos
- security
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

## The Basics

### Installing Homebrew

The official install script pulls from GitHub and requires a one-time password
prompt to install into `/usr/local` (Intel) or `/opt/homebrew` (Apple
Silicon):

```bash
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, verify everything is healthy:

```bash
$ brew doctor
Your system is ready to brew.
```

`brew doctor` is worth running regularly — it catches stale symlinks, PATH
issues, and other common gotchas.

### Essential Commands

```bash
# install a package
$ brew install ripgrep

# uninstall a package
$ brew uninstall ripgrep

# update Homebrew itself and fetch new formula definitions
$ brew update

# upgrade all installed packages to their latest versions
$ brew upgrade

# list what's installed
$ brew list

# show info about a package (version, dependencies, caveats)
$ brew info ripgrep

# remove old versions that are no longer linked
$ brew cleanup
```

A good habit is to run `brew update && brew upgrade && brew cleanup` on a
regular cadence so your tools stay current and your disk doesn't fill up with
old versions.

## Taps

A **tap** is just a Git repository of additional formula definitions outside
the core Homebrew repos. When you tap a repo, Homebrew can install packages
from it as if they were first-party.

```bash
# add a tap
$ brew tap hashicorp/tap

# install from a tap (explicit)
$ brew install hashicorp/tap/terraform

# list taps you've added
$ brew tap

# remove a tap
$ brew untap hashicorp/tap
```

Only tap repos you trust — tapping gives the repo maintainers the ability to
deliver code to your machine.

## Formulae vs. Casks

Homebrew has two main package types:

- **Formula** — a CLI tool or library, built from source or fetched as a
  precompiled binary. Installed into the Homebrew prefix (`/opt/homebrew`).
- **Cask** — a macOS GUI application (`.app`, `.pkg`, `.dmg`). Installed into
  `/Applications` (or `~/Applications`).

```bash
# formula install
$ brew install jq

# cask install
$ brew install --cask firefox

# search across both
$ brew search zed
```

## Writing Your Own Formula

Sometimes a tool isn't in the registry yet. Homebrew makes it
straightforward to write your own formula.

### Formula Anatomy

The simplest formula is a Ruby class that inherits from `Formula`:

```ruby
class Mytool < Formula
  desc "A short description of what mytool does"
  homepage "https://github.com/you/mytool"
  url "https://github.com/you/mytool/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "abc123..."
  license "MIT"

  def install
    bin.install "mytool"
  end

  test do
    system "#{bin}/mytool", "--version"
  end
end
```

### Creating and Testing It

```bash
# create a new formula skeleton
$ brew create https://github.com/you/mytool/archive/refs/tags/v1.0.0.tar.gz

# audit for style/correctness issues
$ brew audit --strict mytool

# install from the local formula file to test
$ brew install --build-from-source mytool

# run the test block
$ brew test mytool
```

Once the formula is working locally, you can either submit a PR to
[homebrew-core][] for wide distribution or maintain it in your own tap.

### Writing a Cask

Casks live in their own DSL:

```ruby
cask "myapp" do
  version "1.0.0"
  sha256 "abc123..."

  url "https://github.com/you/myapp/releases/download/v#{version}/MyApp.dmg"
  name "MyApp"
  desc "A GUI app that does something useful"
  homepage "https://github.com/you/myapp"

  app "MyApp.app"
end
```

## Security Best Practices

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
[homebrew-core]: https://github.com/Homebrew/homebrew-core
[Homebrew]: https://brew.sh/
