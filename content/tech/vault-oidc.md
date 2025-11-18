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

## Setup the dev server

```bash
# in one shell
$ vault server -dev -dev-root-token-id root -dev-tls
...<redacted>...
WARNING! dev mode is enabled! In this mode, Vault runs entirely in-memory
and starts unsealed with a single unseal key. The root token is already
authenticated to the CLI, so you can immediately begin using Vault.

You may need to set the following environment variables:

    $ export VAULT_ADDR='https://127.0.0.1:8200'
    $ export VAULT_CACERT='/var/folders/sm/m3907cc57bv2vmqmzzzw6_v00000gp/T/vault-tls1465023829/vault-ca.pem'


The unseal key and root token are displayed below in case you want to
seal/unseal the Vault or re-authenticate.

Unseal Key: m2xTBuTS8sYb57UfCk0Z8NqciPXKhplaTbX23+sMKFI=
Root Token: root

Development mode should NOT be used in production installations!

# in a separate shell
$ export VAULT_ADDR='https://127.0.0.1:8200'
$ export VAULT_CACERT='/var/folders/sm/m3907cc57bv2vmqmzzzw6_v00000gp/T/vault-tls1465023829/vault-ca.pem'
$ vault login
Token (will be hidden):
Success! You are now authenticated. The token information displayed below
is already stored in the token helper. You do NOT need to run "vault login"
again. Future Vault requests will automatically use this token.

Key                  Value
---                  -----
token                root
token_accessor       e25VzwwYTmVt0jGMkvSsmm4R
token_duration       ∞
token_renewable      false
token_policies       ["root"]
identity_policies    []
policies             ["root"]
```

## Vault Components

- **Storage Backends**: Configures storage location with config file. All data is
  encrypted in transit & at rest. Only one storage backend per cluster.
- **Secrets Engines**: Store, generate or encrypt data and are capable of
  connecting to other platforms to generate dynamic credentials on demand. These
  are enabled and isolated at a path.
- **Authentication Methods**: Perform auth and manage identities. Auth methods
  can be differentiated by human vs system. Once auth'd, Vault will issue a
  client token with an associated policy and TTL. Obtaining a token is the
  fundamental goal of all auth methods.
- **Audit Devices**: Keep logs of reqs and responses in JSON with all sensitive
  information hashed before logging. Vault priorities safety over availability
  and required at least one audit device be enabled and write the log before
  responding to a request.

### Vault Paths

Reserved paths which you cannot use or remove:

| Path Mount Point | Description |
| ---------------- | ----------- |
| `auth/`          | Endpoint for auth method configuration |
| `cubbyhole/`     | Endpoint used by the Cubbyhole secrets engine |
| `identity/`      | Endpoint for configuring Vault identity(entities and groups) |
| `secret/`        | Endpoint used by Key/Value v2 secrets engine *if running in dev mode* |
| `sys/`           | System endpoint for configuring Vault |

### Seal/Unseal

When Vault is "sealed", it doesn't have enough keys to unseal the root key that
is required to decrypt the encryption key used to encrypt data at rest,
basically rendering Vault useless. Unless to meet the unseal threshold of
Shamir's keys(which would be distributed to ~5 other coworkers), Vault will
remain sealed.

[Vault]: https://developer.hashicorp.com/vault/tutorials/get-started/why-use-vault
