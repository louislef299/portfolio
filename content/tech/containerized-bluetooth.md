---
title: "Exploring Dual Bluetooth Roles on One Device"
date: 2024-12-28T16:08:53-06:00
draft: false
---

Today, I am going to attempt to [containerize a bluetooth application][] using
Docker. I've been [learning about the bluetooth protocol using Go]({{< ref
"/tech/simple-bluetooth.md" >}}) and simply copy the Go Central code to my
raspberry pi and run it with Go and Bluez. It works, but it's not easy to
transport since it typically requires the hard-coding of the wifi network into
the pi image. Since I travel around a lot, this should be more flexible and
allow me to publish the container so I can pull it down from any machine(that
runs a container runtime).

## Reading through the article

An initial note: the author linked a Microsoft article about Cloud Native
applications and.. that was a bit unnerving.

Basically, this article is a great reference point to understanding [Bluez][].
It was honestly an interesting approach to sharing a single bluetooth adapter
with mutliple containers on a single node. The idea is there is one bluetooth
service that runs on the node that communicates with other services over a REST
API. Cool architecture, but not really what I directly need.

The recommended approach to actually running everything locally is to have
multiple adapters so, let's take a look at my system and see if I can get around
interacting with the D-Bus.

## Understanding Device Specifications

My current kernal release is:

```bash
[louis@louarch1]$ uname -r
6.12.6-arch1-1
```

With the `bluetoothctl list` and `bluetoothctl show` commands, I was able to
learn that I only have one bluetooth adapter on my device but, it supports both
the central and peripheral roles.

To write bluetooth code in Go on the same device that acts as a central and
peripheral, I can use the [D-Bus API exposed by BlueZ][]. BlueZ provides D-Bus
interfaces for interacting with Bluetooth devices, managing connections, and
handling GATT services for both the central and peripheral roles. Seems a little
complex for something so simple.

## Stepping back a bit

Alright if I'm working directly with the D-Bus to interact with BlueZ, I think
the solution may be more complex than it needs to be. Decided to step back a bit
a just use the old solution I had. Just a combination of [tailscale][] hosts on
my local network that can interact with the pi zeros over bluetooth and ssh.
That way, as long as the tailnet is up and running, I should always have access
to the raspberry pis.

```ascii
+--------------------+
|   Local Computer   |
|  +---------------+ |
|  |   SSH Client  | |
|  +---------------+ |             
+--------------------+             
         |
         | Tailnet
         |
+--------------------+   
|   Tailscale Host   |    
|    (Jump Host)     |    
|  +---------------+ |    
|  |   SSH Client  |<--------------+    
|  +---------------+ |             |    
+--------------------+ Bluetooth   |    
                                   |
+------------------------+         |
| Raspberry Pi Zero 1    |<--------+
|(Bluetooth, SSH, BlueZ) |         |
+------------------------+         |
                                   |
+------------------------+         |
| Raspberry Pi Zero 2    |<--------+
|(Bluetooth, SSH, BlueZ) |         |
+------------------------+         |
                                   |
+------------------------+         |
| Raspberry Pi Zero 3    |<--------+
|(Bluetooth, SSH, BlueZ) | 
+------------------------+  
```

It brought up a good excuse to reformat that new laptop I got my hands on. My
current main node in my home lab isn't super reliable, but if I made that new
laptop the main node, it could be more reliable, I would have access to a direct
interface if things start going wrong instead of having to HDMI into the TV and
crack out the keyboard and mouse.

## Conclusion

Well, funny to come around to the same conclusion I had had before this
experiment. Luckily I learned some information about BlueZ and bluetooth in
general. If I had more time and more of a care, I would definitely look further
into the D-Bus API solution, but for now I'll leave it for another time.

[Bluez]: https://www.bluez.org/
[containerize a bluetooth application]: https://medium.com/omi-uulm/how-to-run-containerized-bluetooth-applications-with-bluez-dced9ab767f6
[D-Bus API exposed by BlueZ]: https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/doc/org.bluez.Device.rst
[tailscale]: https://tailscale.com/kb/1151/what-is-tailscale
