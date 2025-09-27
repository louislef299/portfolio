---
title: "Reflecting on Culture and Platform Engineering"
date: 2025-09-26T20:38:48-05:00
draft: false
tags:
- sysadmin
- culture
---

Egos in corporate software are big yet fragile. Engineers often fall into the
trap of adopting new frameworks and methodologies without fully considering
their organizational context, resulting in fragmented approaches. When platform
building intersects with these tendencies, we encounter a slew of common
pitfalls that lead to increased friction with developer teams and a
deterioration in healthy culture. Platform teams are responsible for being
receptive, accessible and empowering, which enables the shift from centralized
gatekeeping to distributed ownership with guardrails.

Having recently transitioned from working on a [platform team][] to a
high-performing development team that is a consumer of platform services, I've
experienced firsthand how organizational structures can inadvertently create
friction between teams with differing goals. When I say high-performing here, I
really mean having all the skills required to operate as a [loosely coupled
team][]. This capability to self-serve created friction when platform solutions
didn't align with our technical needs or delivery timelines, accentuating the
challenge platforms face in balancing standardization with team autonomy. This
dual perspective has highlighted how [Conway's Law][] manifests in practice -
organizational boundaries often become system boundaries, sometimes in ways that
inhibit rather than enable team effectiveness. This organizational constraint
manifests differently depending on the cultural environment.

[Westrum's cultural typologies][] provide a lens for understanding why platform
teams sometimes become territorial gatekeepers rather than collaborative
enablers. Organizations exhibiting *Pathological* characteristics tend to withhold
information for departmental advantage, creating environments where platform
teams protect their domain rather than serve their users. *Bureaucratic*
cultures, while less adversarial, still compartmentalize responsibilities by
department and prioritize procedural compliance over mission outcomes - leading
to situations where platform teams focus on standardization for its own sake
rather than developer effectiveness. In contrast, *Generative* cultures
encourage cross-functional collaboration and treat failure as learning
opportunities, which creates space for platform teams to genuinely partner with
development teams.

Although partnering with development teams is important, especially when novelty
is introduced, these cultural patterns often manifest as [backlog coupling][].
Platform teams are meant to enable developers, not the other way around. By
chaining requirements for development teams and coupling tenant backlogs to
their platform backlog, they aggressively assert that their priorities and
deadlines are more important than the team they should be enabling. Instead, the
platform team should embrace the "platform as a product" mentality that treats
internal teams as customers and allows those tenants to choose alternatives if
the platform isn't serving their needs. By preventing developers from exploring
alternatives, organizations are actually practicing *Pathological*
characteristics by crushing novelty; disincentivizing further innovation in the
future and eroding trust between teams for future collaboration.

"Build it and they will come" assumes platform teams know what developers need
without doing any user research, interviews, or validation. Additionally, when
platform teams operate in *Bureaucratic* or *Pathological* environments, they
naturally drift toward centralized gatekeeping models that prioritize control
over enablement, making the shift to receptive, accessible, and empowering
practices significantly more challenging. In order to build a platform that
people actually want and will actually use, it is important to start with
developer empathy and hold user-centric values close to all decisions. Developer
innovations should be viewed as product research highlighting unmet needs, not
defection.

This approach allows platform teams to be receptive to developer feedback,
improves accessibility by strengthening relationships between teams and
empowering by helping developers succeed rather than enforcing control. This
type of bidirectional innovation flow leads to a positive feedback loop and a
*Generative* organizational culture topology where platforms learn from
developer experiments and developers benefit from platform stability.

What happens if we don't change? Continuing to operate platform teams as
gatekeepers in *Bureaucratic* or *Pathological* cultural environments
perpetuates the very ego-driven conflicts that inspired this post. The cost of
inaction risks entrenching the very dysfunction they're trying to solve -
creating platform teams that become obstacles rather than accelerators.
Organizations that embrace platform teams as enablers rather than enforcers will
be better positioned to balance standardization with innovation, ultimately
delivering more value to both developers and the business.

[backlog coupling]: https://martinfowler.com/articles/talk-about-platforms.html
[Conway's Law]: https://en.wikipedia.org/wiki/Conway%27s_law
[loosely coupled team]: https://dora.dev/capabilities/loosely-coupled-teams/
[platform team]: https://www.ibm.com/think/topics/platform-engineering
[Westrum's cultural typologies]: https://psychsafety.com/psychological-safety-81-westrums-cultural-typologies/
