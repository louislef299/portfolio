---
title: "SQLite File Encryption with GPG"
date: 2025-12-05T08:14:36-06:00
draft: false
tags:
- go
---

<!-- markdownlint-disable MD052 -->

If you've been following along with these posts(hey Jake), you may know that
I've been focusing my free-time [thinking through how to improve the modularity
of my aws-sso tool][#817]. [My previous post][go-plugins] focused on the problem
of implementing a plugin system leveraging go & gRPC, which gave me the
confidence to start implementing that plugin logic in `aws-sso`(now `knot`). But
I quickly began to think about what this would mean for the core logic and
service that `knot` would provide.

What features of `knot` should be shared with all oauth2 workflows? What would
be special about the core logic of `knot` that would incentivize users to *want*
to integrate with my solution?

Quickly I began to think about having simple yet flexible domains that are
abstracted from the plugin implementation as well as simple security of this
data integrated into the tool. Already, [I'd started implementing][#872] the
`Profile` domain and realized that my little viper configuration format would
not be enough to handle some of the other domains I'd need to manage. So, after
some research and consideration, I landed on leveraging
[SQLite][]([go-sqlite3][]) as an application file format. Due to the sensitive
data that `knot` handles, I will also want to both ensure I am [taking the
necessary precautions][sqlite-defense] and encrypting the database file at rest.
If the [go-sqlcipher][] project hadn't been stale, I probably would have gone
that route, but it looks like the OSS space has grown a little stale in
general🤕.

The rest of this post will just go over go-sqlite basics and file encryption
using gpg and go.

## go-sqlite basics

[#817]: https://github.com/louislef299/aws-sso/issues/817
[#872]: https://github.com/louislef299/aws-sso/pull/872
[go-sqlcipher]: https://github.com/mutecomm/go-sqlcipher
[go-sqlite3]: https://pkg.go.dev/github.com/mattn/go-sqlite3
[SQLite]: https://sqlite.org/appfileformat.html
[sqlite-defense]: https://sqlite.org/security.html

[go-plugins]: {{< ref "/tech/go-plugins.md" >}}
