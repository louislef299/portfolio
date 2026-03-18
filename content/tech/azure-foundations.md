---
title: "Azure Foundations"
date: 2026-03-18T11:37:05-05:00
draft: false
tags:
  - azure
  - secops
  - networking
---

Recently, I started a new gig, which also means that I'm migrating from AWS to
Azure. To me, the most important part to being a cloud engineer is being able to
debug problems in the cloud. This surfaces to ensuring I understand how to debug
networking issues and permissions, which in AWS meant mastering security groups,
VPC flow logs, and IAM. So this post today will just be a small post mostly to
organize the resources I discover while understanding the new terms and
architecture of Azure relative to AWS.

## Entra ID

<!-- The identity layer in Azure. This is where the AWS-to-Azure mental model
diverges the hardest. In AWS, IAM is one thing. In Azure, identity is split
across Entra ID objects: App Registrations (the "app definition"), Service
Principals (the "instance" of an app in a tenant), and Managed Identities (the
Azure-native way to give resources an identity without managing secrets). Know
the difference between all three -- it comes up constantly when debugging RBAC
and workload identity federation. -->

## RBAC Scoping

<!-- Azure RBAC is hierarchical: Management Group > Subscription > Resource Group
> Resource. Permissions inherit downward. This is different from AWS where IAM
policies are flat and attached to principals. Understanding the scoping hierarchy
matters because a role assigned at the subscription level grants access to every
resource group and resource below it, while a role at the resource level is
tightly contained. When debugging "why can't I access this?", always check which
scope the role assignment is on. -->

## Private Endpoints and DNS

<!-- Private endpoints in Azure work differently from AWS PrivateLink. When you
create a private endpoint for a resource (ACR, Key Vault, Storage, etc.), Azure
creates a NIC in your VNet with a private IP, but you also need a Private DNS
Zone linked to the VNet so that the resource's FQDN resolves to the private IP
instead of the public one. If DNS isn't set up correctly, you'll resolve to the
public IP and get blocked by the firewall. The hub-and-spoke topology adds
another layer -- DNS zones are typically centralized in the hub and linked to
spoke VNets. -->

## ARM and Resource Providers

<!-- Everything in Azure is an ARM (Azure Resource Manager) resource. Every
resource has a type like Microsoft.ContainerRegistry/registries or
Microsoft.ContainerService/managedClusters. Resource providers must be registered
on a subscription before you can create resources of that type. This is usually
automatic, but when something fails with "resource provider not registered",
this is why. Understanding the ARM model helps when reading Terraform, navigating
the portal, and making sense of Azure CLI output -- the resource ID paths map
directly to the ARM hierarchy. -->

## Well-Architechted

https://learn.microsoft.com/en-us/azure/well-architected/

## Dex

Discovery mechanism for OAuth2 endpoints, scopes supported, and indications of
various other OpenID Connect features:

`curl http://127.0.0.1:5556/dex/.well-known/openid-configuration`

[JSON Web Keys(JWK)](https://datatracker.ietf.org/doc/html/rfc7517)

`curl http://localhost:5556/dex/keys`

[Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)

## Resources

- [Azure Resource Groups](https://medium.com/@AlexanderObregon/quick-beginners-guide-to-resource-groups-in-azure-2b69ffc79163)
- [Azure Networking](https://medium.com/@AlexanderObregon/cloud-networking-basics-with-azure-16509a99aca6)
- [Using Federated Identities in Azure AKS](https://stvdilln.medium.com/using-federated-identities-in-azure-aks-a440feb4a1ce)
- [Kubernetes Federation with Cloud Identities](https://www.tenable.com/blog/federating-kubernetes-workloads-with-cloud-identities)
- [Azure AD Workload Identity AKS](https://learn.microsoft.com/en-us/azure/aks/workload-identity-deploy-cluster?tabs=new-cluster)
- [Azure for AWS Professionals](https://learn.microsoft.com/en-us/azure/architecture/aws-professional/)
- [Dex IDP](https://dexidp.io/docs/openid-connect/)
