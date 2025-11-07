---
title: "Local OIDC using Vault"
date: 2025-11-07T13:08:03-06:00
draft: true
tags:
- vault
- oauth
- sysadmin
---

OAuth has recently become more and more of an important issue to understand in
my career and one way I like to simplify and understand knowledge gaps is to get
a system running on my local machine. This is what I'm going to cover in this
post; specifically how to setup a local environment using [Vault][] and some
Identity Provider to delegate access as the main authorization server.

<!-- OAuth 2.0 (authorization)-->
https://en.wikipedia.org/wiki/OAuth
https://www.rfc-editor.org/rfc/rfc6749.html

authz: the identity provider is also an API provider, and the response from the
identity provider is an access token that may grant the application ongoing
access to some of the identity provider's APIs, on the user's behalf

OAuth grant types:

- Authorization Code
- PKCE
- Client Credentials
- Device Code
- Refresh Token
- Resource Owner Password Credentials (ROPC)

<!-- OIDC (authentication) -->
https://en.wikipedia.org/wiki/OpenID
OpenID Connect(OIDC) is directly related to OAuth as it is an authentication
layer built on top of OAuth 2.0.

authn: the response from the identity provider is an assertion of identity

<!-- Bearer Token -->
https://www.rfc-editor.org/rfc/rfc6750.html

<!-- PKCE -->
<!-- Specification to mitigate against some OAuth 2.0 threats -->
https://datatracker.ietf.org/doc/html/rfc7636

https://developer.hashicorp.com/vault/tutorials/get-started/introduction-tokens

[Vault]: https://developer.hashicorp.com/vault/tutorials/get-started/why-use-vault
