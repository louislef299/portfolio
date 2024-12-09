---
title: "Communicating Information Abusing Bluetooth in Go"
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

### Notes on GATT

The **Generic ATTribute(GATT)** Profile defines how BLE devices transfer data
back and forth using concepts called Services and Characteristics. GATT is
important to consider when a connection is established between two devices that
have already gone through the advertising process governed by GAP.

Only one peripheral device can be connected to a central at a time using GATT,
meaning that any advertising that had happened prior to GATT will not continue.
This connection then allows for two-way communication between devices.

GATT Servers(Peripherals) and Clients(Centrals) negotiate a connection interval
to transact data. This interval is just a recommendation, however, not a
requirement. The GATT transactions contain nested objects called [Profiles][],
[Services and Characteristics][].

![Profiles, Services, and Chars](/image/microcontrollers_GattStructure.png)

[basics of bluetooth]: https://learn.adafruit.com/introduction-to-bluetooth-low-energy/gap
[ble-playground]: https://github.com/louislef299/ble-playground
[bluez]: https://www.bluez.org/
[Profiles]: https://www.bluetooth.com/specifications/specs/
[Services and Characteristics]: https://www.bluetooth.com/specifications/assigned-numbers/
