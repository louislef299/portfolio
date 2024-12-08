---
title: "Communicating Alternative Information Abusing Bluetooth in Go"
date: 2024-12-07T14:23:59-06:00
draft: false
---

Just going to go over communicating over bluetooth in Go. Over the summer, I had
spent some time learning the [basics of bluetooth][] and made a super simple
central and peripheral example in Go. Now, I am trying to encapsulate other
packets into bluetooth packets, and I will cover that journey with this post.

## Going over the simple example

The central peripheral code can be found in my [ble-playground][] repository.
It's pretty simple and doesn't do anything special, so I'll skip an in-depth
description and instead give this high-level diagram of what it does:

```ascii
┌──────────────────┐            ┌──────────────────────┐
│                  │            │ Scan for device with │
│  PiZero loupi5   ┼─────────►  │ name loupi5. Once    │
│                  │            │ found: connect,      │
│                  ┼─────────►  │ discover services,   │
│    advertise..   │            │ and then disconnect  │
│                  ◄────────────┼                      │
│                  │            │   (Central)          │
│   (Peripheral)   │            └────────────────────── 
└──────────────────┘                                    
```

The PiZero in this case was on my local network and I had it advertise bluetooth
using [bluez][] and uploaded the Go binary with `scp`.

[basics of bluetooth]: https://learn.adafruit.com/introduction-to-bluetooth-low-energy/gap
[ble-playground]: https://github.com/louislef299/ble-playground
[bluez]: https://www.bluez.org/
