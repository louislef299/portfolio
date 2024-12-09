---
title: Playground for Network Interfaces
date: 2023-11-04
---

Just messing around with network interfaces in an attempt to understand
some of the low-level OS fundamentals. I was led in this direction when
looking at Wireguard's packages and getting a fun,system-level example of
how to run system calls and file descriptors to configure network interfaces
in Go.

## Wireguard's TUN interface

Referenced code can be found [here][TUN project].

### Setting Up

The TUN interface is created at `/dev/net/tun` and represents the tunnel
used to communicate with the external service. When running through
Cloudflare's [Understanding TUN/TAP][], it made more sense that this TUN
device represented a local point-to-point connection with the Wireguard
service. Found this fun rhyme to remember the difference between the device
types:

> Tap is like a switch,\
Ethernet headers it'll hitch.\
Tun is like a tunnel,\
VPN connections it'll funnel.\
Ethernet headers it won't hold,\
Tap uses, tun does not, we're told.

To see Wireguard create the TUN interface, a lot of the code in `FirstExample()`
is pulled directly from the [Wireguard Mirror][]'s `main.go` function. See the
example with the following:

```bash
# In one terminal, run FirstExampe() to create the TUN interface:
sudo go run main.go

# Then in another terminal, view the TUN interface using iproute2:
# (Should output louis0: tun vnet_hdr)
ip tuntap list
ip -s link show dev louis0
```

When the device is being setup, Wireguard goes through the following
stages:

1. Open `/dev/net/tun` to request new interface device
2. Generate a new device request through `ioctl()`(OS dependent) with flags
3. Send `ioctl()` device request
4. Set file descriptor to non-blocking
5. Create a new file from fd to `/dev/net/tun`??
6. Create the TUN from the generated file => the NativeTun is the software interface used to interact with the application

### Understanding NativeTun

TODO

Will want to understand how Wireguard actually interacts with TUN
once created. Will be a bit different than the TAP document, but
should be able to pull references from there and Tailscale.

## References

- [Point-to-Point topology][]
- [Linux TUN/TAP Networking][]
- [Wireguard Mirror][]
- [Understanding TUN/TAP][]
- [File descriptor deep dive][]
- [TUN/TAP Interface Tutorial][]

[Linux TUN/TAP Networking]: https://docs.kernel.org/networking/tuntap.html
[Wireguard Mirror]: https://github.com/tailscale/wireguard-go
[Point-to-Point topology]: https://lightyear.ai/blogs/point-to-point-leased-lines-p2p-vs-wavelength-circuits
[Understanding TUN/TAP]: https://blog.cloudflare.com/virtual-networking-101-understanding-tap/
[File descriptor deep dive]: https://copyconstruct.medium.com/nonblocking-i-o-99948ad7c957
[TUN/TAP Interface Tutorial]: https://backreference.org/2010/03/26/tuntap-interface-tutorial/
[TUN Project]: https://github.com/louislef299/go-scripts/blob/main/projects/network-interfaces/main.go
