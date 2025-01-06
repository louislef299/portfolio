---
title: "Learning DBus"
date: 2025-01-05T12:26:41-06:00
draft: false
---

Alright, so in the past, I had gotten low enough to the system level with BlueZ
that I had pondered learning the basics of DBus([containerized ble]({{< ref
"/tech/containerized-bluetooth.md" >}})).

## What is DBus?

In short, it is a generic Inter-Process Communication(IPC) used by Linux and
other operating systems and leveraging Unix domain sockets(AF_UNIX), but can
also be used over TCP/IP(AF_INET), though not recommended.

![Linux DBus Architecture](/image/linux-dbus.jpg)

From [Pid Eins][] on why DBus even exists:

> ...what AF_UNIX/FIFOs are to DBus, TCP is to HTTP/REST. While AF_UNIX
> sockets/FIFOs only shovel raw bytes between processes, DBus defines actual
> message encoding and adds concepts like method call transactions, an object
> system, security mechanisms, multicasting and more

[Pid Eins][] offers a super helpful introduction to DBus concepts & terms, so I
would recommend running over there quickly to review the terms if you are
unfamiliar. One thing to note on interfaces is when creating services on DBus,
it is good to reference some of the [standard interfaces][] DBus provides.

## Interacting the DBus through the CLI

Interacting with DBus is nice and easy with `busctl`. However, in order to
fully understand DBus, I'm going to try and use the native [dbus-send][] cli.

### Listing Services

First thing's first, I'm going to list the active connections on the session
bus by calling the `ListNames` method of the `/org/freedesktop/DBus` object at
the `org.freedesktop.DBus` service. The `org.freedesktop.DBus` interface exposes
the `ListNames` method, allowing us to call `org.freedesktop.DBus.ListNames`:

```bash
dbus-send --session --dest=org.freedesktop.DBus \
  --type=method_call --print-reply /org/freedesktop/DBus \
  org.freedesktop.DBus.ListNames
```

The two types of bus names that are returned:

1. Unique Name(:1.685)
2. Well-Known Name(org.bluez)

All DBus clients have a unique name, but services with a well-known name are
easier to access. Well-known names are similar to DNS in that they are only used
for message routing.

It looks like you can also find out what services exist in the DBus
configuration under `/usr/share/dbus-1/services`. One important note is when
interacting the services on the DBus, make sure you are sending those messages
on the correct bus. For instance, BlueZ will typically be using the system bus.

### Introspection

While the `dbus-send` tool is powerful, I've found that it isn't super ideal for
introspection. Just to make things easier, I'm using `busctl` here:

```bash
[louis@louarch1 ~]$ busctl introspect org.bluez /org/bluez/hci0
NAME                                TYPE      SIGNATURE RESULT/VALUE                             FLAGS
org.bluez.Adapter1                  interface -         -                                        -
.GetDiscoveryFilters                method    -         as                                       -
.RemoveDevice                       method    o         -                                        -
.SetDiscoveryFilter                 method    a{sv}     -                                        -
.StartDiscovery                     method    -         -                                        -
.StopDiscovery                      method    -         -                                        -
...
org.bluez.NetworkServer1            interface -         -                                        -
.Register                           method    ss        -                                        -
.Unregister                         method    s         -                                        -
org.freedesktop.DBus.Introspectable interface -         -                                        -
.Introspect                         method    -         s                                        -
org.freedesktop.DBus.Properties     interface -         -                                        -
.Get                                method    ss        v                                        -
.GetAll                             method    s         a{sv}                                    -
.Set                                method    ssv       -                                        -
.PropertiesChanged                  signal    sa{sv}as  -                                        -
```

This command returns the methods, properties and signals of the bluetooth
service. The specific type notation can be found [here][dbus sigs], but here are
the signatures:

Character | Code Data Type
--- | ---
y | 8-bit unsigned integer
b | boolean value
n |16-bit signed integer
q | 16-bit unsigned integer
i | 32-bit signed integer
u | 32-bit unsigned integer
x | 64-bit signed integer
t | 64-bit unsigned integer
d | double-precision floating point (IEEE 754)
s | UTF-8 string (no embedded nul characters)
o | DBus Object Path string
g | DBus Signature string
a | Array
( | Structure start
) | Structure end
v | Variant type (described below)
{ | Dictionary/Map begin
} | Dictionary/Map end
h | Unix file descriptor

If you really want to use `dbus-send` and parse through the returned xml, just
run :

```bash
dbus-send --system --dest=org.bluez --type=method_call --print-reply \
    /org/bluez/hci0 org.freedesktop.DBus.Introspectable.Introspect
```

I've found it to be helpful when figuring out how to implement the arguments
that are passed to the methods. For instance, here is the xml data for the
`SetDiscoveryFilter` method:

```xml
<method name="SetDiscoveryFilter">
    <arg name="properties" type="a{sv}" direction="in"/>
</method>
```

### Calling a DBus Service Method

To call a super simple method from the `org.bluez` service, I just chose the
`StartDiscovery` method since it doesn't take any input parameters. Just run:

```bash
busctl call org.bluez /org/bluez/hci0 org.bluez.Adapter1 StartDiscovery
```

or with `dbus-send`:

```bash
dbus-send --system --dest=org.bluez --type=method_call --print-reply \
    /org/bluez/hci0 org.bluez.Adapter1.StartDiscovery
method return time=1736121400.427641 sender=:1.4 -> destination=:1.368 serial=1054 reply_serial=2 
```

Here is how you can access a DBus property, in this example, getting the
bluetooth adapter name:

```bash
dbus-send --system --dest=org.bluez --type=method_call --print-reply \
    /org/bluez/hci0 org.freedesktop.DBus.Properties.Get \
    string:"org.bluez.Adapter1" string:"Name"
method return time=1736121705.000813 sender=:1.4 -> destination=:1.370 serial=1059 reply_serial=2
   variant       string "louarch"
```

## Signal Example in Go

Since I was having the most problems with signals using BlueZ, I'm going to run
through a quick DBus signal example using the [Go DBus pkg][] by [registering my
own DBus service][] and monitoring for signals.

This article is getting a bit large, however, so I'm going to work with DBus in
Go in a different article.

[dbus-send]: https://linux.die.net/man/1/dbus-send
[dbus sigs]: https://pythonhosted.org/txdbus/dbus_overview.html
[Go DBus pkg]: https://pkg.go.dev/github.com/godbus/dbus
[Pid Eins]: http://0pointer.net/blog/the-new-sd-bus-api-of-systemd.html?source=post_page-----e4039c4f17dc--------------------------------
[registering my own DBus service]: https://nyirog.medium.com/register-dbus-service-f923dfca9f1
[standard interfaces]: https://dbus.freedesktop.org/doc/dbus-specification.html#standard-interfaces
<!-- https://ukbaz.github.io/howto/python_gio_1.html
https://nyirog.medium.com/discover-dbus-a00798058b00 -->
