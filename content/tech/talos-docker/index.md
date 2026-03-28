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
