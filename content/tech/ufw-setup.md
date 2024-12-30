---
title: "ufw Setup"
date: 2024-12-30T16:27:51-06:00
draft: false
tags:
- linux
- security
---

Uncomplicated Firewall([ufw][]) is a program that manages a netfilter firewall
on Linux. There are tons of resources out there that discuss the benefits of a
firewall and how they control and monitor ingress/egress traffic flowing through
a system, but I'm going to focus on the super simple configuration I have on my
system.

## The Basics

First, simply install `ufw` on your system. Validate that `ufw` is properly
running with `systemctl status ufw` and `ufw status verbose`. A simple default
configuration looks like:

```bash
Status: active
Logging: off
Default: deny (incoming), allow (outgoing), deny (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22                         LIMIT IN    Anywhere                  
Anywhere                   ALLOW IN    192.168.0.0/24            
22 (v6)                    LIMIT IN    Anywhere (v6)
```

https://github.com/poddmo/ufw-blocklist?tab=readme-ov-file

[ufw]: https://wiki.archlinux.org/title/Uncomplicated_Firewall
