---
title: "Building a custom BLE Service in Go"
date: 2024-12-30T14:21:46-06:00
draft: false
---

In this article we will be creating a custom Bluetooth Service in Go. I'll be
walking through the [NovelBits article][] and use the [tinygo pkg][]. The
requirements I have for my current project require a custom Bluetooth Service as
none of the pre-defined services from [Bluetooth SIG][] cover my use case.

[Bluetooth SIG]: https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Assigned_Numbers/out/en/Assigned_Numbers.pdf?v=1735501678042
[NovelBits article]: https://novelbits.io/bluetooth-gatt-services-characteristics/
[tinygo pkg]: https://pkg.go.dev/tinygo.org/x/bluetooth
