---
title: "Talos Basics with Docker"
date: 2026-03-28T10:11:43-05:00
draft: false
toc: true
tags:
  - k8s
  - docker
  - linux
---

Recently, I've wanted to rebuild my kubernetes cluster home lab so that I could
host some backend compute. Cloud providers tend to over-charge for compute and I
would rather all my services go down than have a rogue compute instance that
gives me a surprise bill at the end of the month. Today, I'm just going to go
over [creating a talos cluster with docker][Talos install Docker] from the
perspective of a crusty old k8s admin.

## Why Talos?

Just wanted to touch on my decision to use Talos Linux instead of vanilla
kubernetes. Well, in the past, I'd had a kubernetes cluster in my homelab that
I'd spun up with [`kubeadm`][] ontop of [arch(btw)][] and [raspbian][]. It
worked, but it got annoying to shell into each instance and run
`pacman -Syu`/`apt update && apt upgrade && systemctl restart` once a week. My
knee-jerk reaction was to spin up an ansible tower instance, but I'd worked with
ansible enough to know that I didn't want to waste my time with the project (in
favor of immutable infrastructure).

Eventually, the homelab got ignored as I moved onto other interests and the
cluster gathered some dust. This is expected and if I'm going to maintain a
homelab again, I need something that is simpler to maintain out-of-the-box.
After reading up on talos a bit, [their philosophy][Philosophy of Talos],
`talosctl` and a simple talos iso binary is what drew me to the project. A
kubernetes cluster embedded into the linux os & all maintained over gRPC? It
sounds too good to be true, right?

This post will put talos to the test by installing it via docker and playing
around with it to ensure it's the right solution. The goal is to get a feel for
the ecosystem and decide if Talos is worth investing in.

## Setup Talos on Docker

Instead of annoying english, I'm just going to explain the setup with a code
block:

```sh
# I'm going to assume docker is installed...
$ brew install kubernetes-cli siderolabs/tap/talosctl

$ talosctl cluster create docker
generating PKI and tokens
creating state directory in "/Users/louis/.talos/clusters/talos-default"
downloading ghcr.io/siderolabs/talos:v1.12.5
creating network talos-default
creating controlplane nodes
creating worker nodes
waiting for Talos API (to bootstrap the cluster)
bootstrapping cluster
◳ waiting for etcd to be healthy: 1 error occurred:
    * 10.5.0.2: service "etcd" not in expected state "Running": current state [Preparing] Running pre state
context deadline exceeded
# exit(1)
```

Ope! We really are going to have to roll up our sleeves earlier than I thought.
Since I left my personal device at home, the corporate network is signing
everything with their internal certificate[^1]. We're going to need to configure
talos to trust this certificate instead of expecting theirs. Let's tear the
cluster down and try again: `talosctl cluster destroy`.

![Roman Mad @ Certificates](roman.gif)

### Slight Certificate Detour

Talos offers a clean solution with their [`TrustedRootsConfig`][] resource. I
created the spec at `~/.talos/ca-patch.yaml:

```yaml
# ca-patch.yaml
---
apiVersion: v1alpha1
kind: TrustedRootsConfig
name: custom-ca
certificates: |-
  -----BEGIN CERTIFICATE-----
  ...
```

Then, I just recreated the cluster:

```sh
$ talosctl cluster create docker --config-patch @/Users/louis/.talos/ca-patch.yaml

# config cli to prevent numerous -n flag requirements
$ talosctl config nodes 10.5.0.2 10.5.0.3

$ talosctl services
NODE       SERVICE      STATE     HEALTH   LAST CHANGE   LAST EVENT
10.5.0.2   apid         Running   OK       19m31s ago    Health check successful
10.5.0.2   containerd   Running   OK       19m32s ago    Health check successful
10.5.0.2   cri          Running   OK       19m31s ago    Health check successful
10.5.0.2   etcd         Running   OK       19m12s ago    Health check successful
10.5.0.2   kubelet      Running   OK       19m21s ago    Health check successful
10.5.0.2   machined     Running   OK       19m32s ago    Health check successful
10.5.0.2   trustd       Running   OK       19m31s ago    Health check successful
10.5.0.3   apid         Running   OK       19m31s ago    Health check successful
10.5.0.3   containerd   Running   OK       19m32s ago    Health check successful
10.5.0.3   cri          Running   OK       19m31s ago    Health check successful
10.5.0.3   kubelet      Running   OK       19m19s ago    Health check successful
10.5.0.3   machined     Running   OK       19m32s ago    Health check successful

$ kubectl get no,ns
NAME                                STATUS   ROLES           AGE   VERSION
node/talos-default-controlplane-1   Ready    control-plane   18m   v1.35.2
node/talos-default-worker-1         Ready    <none>          18m   v1.35.2

NAME                        STATUS   AGE
namespace/default           Active   19m
namespace/kube-node-lease   Active   19m
namespace/kube-public       Active   19m
namespace/kube-system       Active   19m
```

Nice, got a little talos cluster running locally!

## Under the Hood

Now that we have a cluster running, let's take a step back and look at what
Talos actually _is_ under the hood. If you're evaluating Talos for a homelab (or
production), it's worth understanding the design decisions baked into the ISO
before committing. Talos isn't just "Kubernetes on Linux" — it's a purpose-built
OS with opinions about boot, security, and operations that differ significantly
from a traditional distro.

### The Boot Sequence

Talos boots differently than you'd expect. There's no systemd, no init scripts,
no package manager. The entire userspace is a single binary — `machined` — that
owns the boot process and spawns the handful of services needed to run
Kubernetes. The [Architecture][] page covers the high-level structure: an
immutable SquashFS rootfs, an API-driven control plane, and no SSH.

The [Components][] page breaks down what actually runs: `machined` (PID 1),
`apid` (the Talos API), `trustd` (certificate management between nodes), and
the Kubernetes components themselves. Each of these is managed through an
internal state machine — not a process supervisor. The [Controllers and
Resources][] page explains how this works: controllers watch typed resources and
reconcile state, similar to Kubernetes controllers but for the OS itself. This
is the machinery that drives the bootstrap sequence from "fresh boot" to
"healthy Kubernetes node."

For bare metal, the [Boot Loader][] page covers the GRUB/systemd-boot choice
and A/B partition scheme that enables atomic upgrades and rollbacks.

### Kernel & Security Choices

Talos ships a custom kernel config. The [Philosophy][] page lays out the "why":
minimal attack surface, immutability, and API-only access. No shell, no SSH, no
way to `exec` into the host. If you can't get a shell, entire classes of attacks
disappear.

The specifics of _how_ they lock things down are spread across a few pages:

- [Process Capabilities][] — Talos drops Linux capabilities aggressively. System
  services run with only the caps they need, nothing more. This is the kind of
  thing you'd configure manually with systemd unit files on a traditional distro;
  here it's baked in.
- [Customizing the Kernel][] — This is the page that shows what kernel options
  Talos enables and disables. Lockdown mode, module signing restrictions,
  hardened memory allocator options — the choices a security-conscious admin
  would make, applied by default.
- [SecureBoot][] — Full chain-of-trust from UEFI firmware through the
  bootloader to the kernel and initramfs. Optional but supported out of the box.

### The ISO & Extension Model

Talos ISOs aren't assembled like traditional distros. The [Image Factory][]
explains how images are built from "schematics" — a declarative spec of what
extensions and overlays to include. Need ZFS, iSCSI, or Intel GPU drivers?
You don't install packages post-boot; you bake them into the image via [System
Extensions][]. The rootfs stays immutable, and extensions are layered in at
image build time.

This is the tradeoff: you give up `apt install` flexibility for reproducible,
declarative images. For a homelab that "gathers dust" when you move onto other
interests (ask me how I know), this is a feature.

### Suggested Reading Order

If you want to dig into these yourself, here's how I'd order them:

1. [Philosophy][] — _why_ these choices were made
2. [Architecture][] — overall structure
3. [Components][] — what runs and when
4. [Controllers and Resources][] — how the bootstrap sequence is driven
5. [Process Capabilities][] — security restrictions
6. [Customizing the Kernel][] — specific kconfig decisions
7. [SecureBoot][] — full trust chain
8. [Image Factory][] + [System Extensions][] — how the ISO is composed

## Further Reading

- [Introduction to Talos](https://blog.yadutaf.fr/2024/03/14/introduction-to-talos-kubernetes-os/)
- [Talos on Hetzner Dedicated](https://seankhliao.com/blog/12026-02-28-talos-on-hetzner-dedicated/)
- [No Port Forwards, No Drama: A Practical Two-Box Self-Hosting Architecture](https://medium.com/stackademic/no-port-forwards-no-drama-a-practical-two-box-self-hosting-architecture-aa415c6abb2d)
- [Talos Linux vs. K3s: What's the Difference?](https://www.siderolabs.com/blog/talos-linux-vs-k3s/)

[^1]:
    _Think of HTTPS like sending a sealed letter. Normally, you seal it and only
    the recipient can open it. But corporate networks run a post office in the
    middle — a TLS-terminating forward proxy — that opens your letter, checks
    for contraband, puts it in a *new* envelope sealed with *their* stamp, and
    sends it on its way. Your laptop already knows to trust that stamp. A Talos
    container, freshly spun up with no knowledge of corporate politics, sees an
    unfamiliar seal and refuses to accept the mail. That
    `x509: certificate signed by unknown authority` error? That's Talos saying
    "this stamp isn't in my address book." Cloudflare covers this concept well
    in their blog post [Monsters in the Middleboxes][]._

[arch(btw)]: https://wiki.archlinux.org/title/Kubernetes
[`kubeadm`]: https://kubernetes.io/docs/reference/setup-tools/kubeadm/
[Monsters in the Middleboxes]:
  https://blog.cloudflare.com/monsters-in-the-middleboxes/
[Philosophy of Talos]:
  https://docs.siderolabs.com/talos/v1.12/learn-more/philosophy
[raspbian]: https://www.raspberrypi.com/software/operating-systems/
[Talos install Docker]:
  https://docs.siderolabs.com/talos/v1.12/platform-specific-installations/local-platforms/docker
[`TrustedRootsConfig`]:
  https://docs.siderolabs.com/talos/v1.12/reference/configuration/security/trustedrootsconfig
[Architecture]:
  https://docs.siderolabs.com/talos/v1.12/learn-more/architecture/
[Boot Loader]:
  https://docs.siderolabs.com/talos/v1.12/talos-guides/install/bare-metal-platforms/bootloader/
[Components]:
  https://docs.siderolabs.com/talos/v1.12/learn-more/components/
[Controllers and Resources]:
  https://docs.siderolabs.com/talos/v1.12/learn-more/controllers-resources/
[Customizing the Kernel]:
  https://docs.siderolabs.com/talos/v1.12/talos-guides/configuration/customizing-the-kernel/
[Image Factory]:
  https://docs.siderolabs.com/talos/v1.12/learn-more/image-factory/
[Process Capabilities]:
  https://docs.siderolabs.com/talos/v1.12/learn-more/process-capabilities/
[SecureBoot]:
  https://docs.siderolabs.com/talos/v1.12/talos-guides/install/bare-metal-platforms/secureboot/
[System Extensions]:
  https://docs.siderolabs.com/talos/v1.12/talos-guides/configuration/system-extensions/
