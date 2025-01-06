---
title: "Minecraft Server"
date: 2025-01-04T12:52:04-06:00
draft: false
tags:
- linux
- sysadmin
---

Alright, recently my friends and I wanted to start up a new Minecraft world, and
I got challened to host my own server. It wound up being super easy and I'm just
going to go over how I configured the server and any other notes here.

## About the Setup

To allow all of my friends to access the local server, I gave them access to my
[tailnet][]. It works super slick for now, but I had to upgrade to the [personal
plus plan][] and fork over the extra $6 for this first month. Long-term, I'm
going to setup an OpenVPN on my network so that I can get around this and
surpass my 6 user limit.

It will be pretty hard to ditch the tailnet, however, because it was stupid
simple to setup and it's way less demanding as opposed to a VPN by only routing
the necessary traffic over the tailnet. Getting my non-techy friends and
technically-saavy friends to onboard to the tailnet was nice and easy by either
emailing them a link or sending them an onboarding link. Then after adding my
account, they were a part of my network!

After they successfully joined the tailnet, they just had to server name using
my custom DNS domain and they were in.

## Setting up the Minecraft Server

Luckily, there was a great doc in the [Arch Wiki on Minecraft][] that I could
follow to configure the server. It was a pretty easy setup of configuring the
`minecraft` user and group and then starting the service with systemd.

### Permissions

#### Creating the `minecraft` user and group

Pretty simple to create the [user and group][], and just called them both
`minecraft`. Here are the steps:

```bash
# Create minecraft group
sudo groupadd minecraft

# Create minecraft user, assign it to the minecraft group, and create a home directory
sudo useradd -m -g minecraft minecraft
```

Since I am running the Minecraft server with systemd, I just validated that the
Minecraft service was running with the correct user and group(located at
`/lib/systemd/system/minecraftd.service`):

```ini
[Service]
Type=forking
ExecStart=/usr/bin/minecraftd start
ExecStop=/usr/bin/minecraftd stop
User=minecraft
Group=minecraft
```

#### Set permissions for the Minecraft directory

In order to ensure that the `minecraft` user has the appropriate permissions to
access and modify files in the `/srv/minecraft` directory, I made sure to
provided the user and group ownership:

```bash
# Change ownership of the /srv/minecraft directory to the minecraft user and group
sudo chown -R minecraft:minecraft /srv/minecraft

# Set the appropriate permissions
sudo chmod -R 755 /srv/minecraft
```

#### Add my user to the `minecraft` group

Finally, to make sure I had all the necessary permissions to the directory, I
made sure to add myself to the group as well:

```bash
# Add an existing user to the minecraft group
sudo usermod -aG minecraft louis
```

### Running the Server

First, needed to accept the EULA by modifying `/srv/minecraft/eula.txt`. We also
wanted a solid spawn point, so I configured `level-seed` of the
`server.properties` file to have the [cherry blossom
value][](-5584399987456711267). Then, just a super simple `systemctl start
minecraftd` was needed. I also made sure to `enable` the service so that is runs
on reboot.

## Monitoring

Since there are people that rely on this server now and I want to make sure they
know when the server is healthy and when it isn't, I was thinking I could
monitor the server with Prometheus from my RaspberryPi. It would be a pretty
simple setup of running a node-exporter for general server information, the [JVM
and more system-specific minecraft-prometheus-exporter][JVM monitor] and maybe
even the more [gameplay-specific minecraft-prometheus-exporter][minecraft
monitor].

I'll have to make a post about that later, I haven't had time to finish
configuring that monitoring, but would be simple to first get it monitoring and
then later to get alerting setup to the minecraft slack channel.

[Arch Wiki on Minecraft]: https://wiki.archlinux.org/title/Minecraft/Java_Edition_server
[cherry blossom value]: https://www.rockpapershotgun.com/best-minecraft-seeds-java-survival-seeds
[JVM monitor]: https://github.com/sladkoff/minecraft-prometheus-exporter
[minecraft monitor]: https://github.com/dirien/minecraft-prometheus-exporter
[personal plus plan]: https://tailscale.com/pricing?plan=personal
[tailnet]: https://tailscale.com/kb/1136/tailnet
[user and group]: https://wiki.archlinux.org/title/Users_and_groups
