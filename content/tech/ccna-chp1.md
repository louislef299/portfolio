---
title: 'CCNA Journey - Introduction to TCP/IP Networking'
date: 2024-02-18T14:17:49-06:00
draft: false
tags:
- net
- tcp
---

Chapter 1 starts off with getting some initial perspectives on networking down
as a general introduction. This was all really review as they just talked about
the different ways and individual or enterprise connect to a network and through
which mediums.

After an initial network introduction, the reading went into the TCP/IP
networking model and the history of the initial battle between the OSI model and
TCP/IP. The important historical value to note is that in the late 1970s and
early 1980s, the OSI model looked to be the model that would win out. That is
why you see lots of documentation still reference "Layer 7" protocols even
though the TCP/IP model won out and only technically has 5 layers.

Here is a useful diagram of both models and the protocols they implement:

![TCP/IP Networking Model](/image/tcp-ip-network-model.jpg)

The TCP/IP model references protocols that are used to allow and dictate
communication between computers. Protocol definitions are defined as [RFCs][].
Each layer in the TCP/IP stack serves the layer above it and utilizes the layer
below.

Adjacent-layer communication and same-layer communication are two important
concepts when thinking about the TCP/IP model(verbatim from the book):

<!-- markdownlint-disable MD033 MD013 -->
Concept | Description
 --- | ---
 Same-layer interation on different computers | The two computers use a protocol to communicate with the same layer on another computer. The protocol defines a header that communicates what each computer wants to do.
 Adjacent-layer interation on the same computer | On a single computer, one lower layer provides a service to the layer just above. The software or hardware that implements the higher layer requests that the next lower later perform the needed function.
<!-- markdownlint-enable MD033 MD013 -->

## Application Layer(L7-L5)

The application layer defines services that the applications need, acting as an
interface between the actual application software and the network. For example,
HTTP defines how web browsers can pull the contents of a web page from a web
server.

## Transport Layer(L4) [Segment]

The transport layer serves the application layer by providing two popular
protocols: [TCP and UDP][].

### TCP(Transmission Control Protocol)

To explain the basics of the benefits the transport layer serves to the
application layer, there is a lot of information around the TCP protocol. It is
easier to understand the separation of concerns through TCP because of its
error-checking, guaranteed delivery, and order preservation.

## Network Layer(L3) [Packet]

This section just basically revolves around the Internet Protocol(IP). There is
a pretty abstract postage example, but since I already kinda understand how this
works, we are going to skip it. The main idea is that the IP header will include
a destination and source IP address that is used when routing the packet.

Most of this book revolves around the IP protocol, so more information to come!

## Data-Link and Physical Layers(L2-L1) [Frame]

This layer defines the protocols *and* hardware required to actually deliver
data across some physical network. They are usually combined since the physical
layer is just the hardware required to transmit the data, which the data-link
layer is actually encapsulating headers onto the frame. Data-link will typically
encapsulate a header and trailer onto the frame:

```bash
  LH = Link-Header
  LT = Link-Trailer

  +----+-----------+----+
  | LH | IP Packet | LT |
  +----+-----------+----+
```

## Additional Notes

Important to not only understand encapsulation but also de-encapsulation. Just
the reverse of the TCP/IP stack when a device receives content.

Also, a protocol data unit(PDU) represents the bits that include the headers and
trailers for that layer, as well as the encapsulated data. It is an OSI term
that is important to know and references each layer PDU as LxPDU("x" being the
layer number in this case).

[RFCs]: https://www.ietf.org/standards/rfcs/
[TCP and UDP]: https://meghagarwal.medium.com/tcp-vs-udp-c3dedd91f66d
