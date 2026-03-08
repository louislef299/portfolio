---
title: "Block the Bots"
date: 2026-03-06T18:07:37-06:00
draft: false
toc: true
tags:
  - secops
  - webdev
  - ai
  - cloudflare
---

<!-- markdownlint-disable MD033 MD013 -->

## The Crawl Ratio Problem

The agentic internet is on the rise. In 2025 Q2, the visitation ratio for human
to AI bot traffic was 50:1. By Q4, AI bot traffic increased with a ratio of
31:1<sub>([1](#1))</sub>. With 4.2% of all HTTP internet traffic originating
from AI bots in 2025<sub>([2](#2))</sub>, and crawl-to-refer ratios looking
abysmal<sub>([3](#3))</sub>(Anthropic @ 41.1K:1 & OpenAI @ 1.1K:1), the internet
is increasingly becoming dominated by bot traffic.

For reference, DuckDuckGo's crawl-to-refer ratio is at 0.84:1, making the
relationship with their bots much more advantageous for web developers and the
trade-off clear: I let you crawl my content, you help surface my page in your
search engine. This is now becoming a broken relationship as internet content is
increasingly being crawled for training purposes without the referal benefits.

So, how do we, as web developers, protect our content and compete in this
agentic internet age? We'll go over three defensive measures you can take
against AI bot traffic and even some of the newer and evolving tools that are
surfacing that provide payment for your content to AI bots<sub>([4](#4))</sub>.

{{< block-bots-full-stack >}}

## Layer 1: robots.txt (The Polite Ask)

For the unaware, [robots.txt][] is a plaintext file at the root of your site
that tells crawlers what they can and can't access. You can view min that tries
to target the most common `#AI Crawlers`: [/robots.txt](/robots.txt). This is
the first line of defense and has been the de facto standard since the
mid-90s<sub>([5](#5))</sub>.

A static `robots.txt` in the age of the agentic internet presents a problem:
this list becomes stale _rapidly_. Cloudflare offers solutions to [manage your
robots.txt][] file for you, companies like [Tollbit][] offer a
dynamically-updated robots.txt as well that tracks new crawlers as they appear,
and [ai.robots.txt][] is an opensource alternative I've taken to using.

Even if you switch to dynamically-generated `robots.txt` files, poorly-behaved
bots just treat this as a suggestion. The next layer required enforcement.

## Layer 2: Meta Tags & Headers (The Written Notice)

You can also express your intent directly in HTML or HTTP headers using the
`noai` and `noimageai` directives. These originated from [DeviantArt in 2022][]
and have since been adopted more broadly:

```html
<!-- In your <head> -->
<meta name="robots" content="noai, noimageai" />
```

Or via HTTP headers (useful for non-HTML assets like images and PDFs):

```text
X-Robots-Tag: noai, noimageai
```

On a static site like one built with Hugo, you can add the meta tag to your base
template. For the header approach, it depends on your hosting platform — we'll
cover that per-platform below.

These aren't formal web standards _yet_, but OpenAI, Google, and Anthropic have
all publicly stated they honor them. Think of this layer as putting a "No
Trespassing" sign on your lawn. Honest visitors will respect it. For the rest,
you need a fence.

## Layer 3: Server-Side Enforcement (The Fence)

This is where things get platform-specific. The idea is simple: inspect the
`User-Agent` header on incoming requests and reject known AI crawlers at the
server level before they ever touch your content.

### Cloudflare

If you're behind Cloudflare, you've got the most options. We've already gone
over their managed `robots.txt` solution, but they also offer more.

#### One-click AI bot blocking

Navigate to **Security > Bots** in your dashboard and toggle **Block AI Scrapers
and Crawlers**. This has been used by over one million Cloudflare customers
since its launch. As of mid-2025, [Cloudflare blocks AI bots by default][] for
new domains — the first major infrastructure provider to do so.

You can also fine-tune this with **AI Crawl Control**, which lets you allow or
block specific crawlers individually rather than blanket-blocking everything.

#### AI Labyrinth

This is Cloudflare's most creative defense. When [AI Labyrinth][] detects an
unauthorized crawler, instead of blocking it, it lures the bot into a maze of
AI-generated decoy pages:

{{< block-bots-l3 >}}

The links to the labyrinth are invisible to humans but visible in the HTML —
acting as a honeypot. Any visitor that goes multiple links deep into the maze is
almost certainly a bot, which gives Cloudflare data to fingerprint and catalog
bad actors. It's available on all plans including free, and it's opt-in via a
single toggle.

### Netlify

Netlify offers a [User Agent Blocker][] extension that blocks requests from a
preset list of AI crawlers using an [Edge Function][Netlify Edge Functions]. To
set it up:

1. Install the User Agent Blocker extension from the Netlify integrations hub
2. Select all AI crawler options under **Block User Agents**
3. Deploy

For more control, you can write your own Edge Function that inspects the
`User-Agent` header:

```typescript
// netlify/edge-functions/block-bots.ts
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "Bytespider",
  "cohere-ai",
  "FacebookBot",
];

export default async (request: Request) => {
  const ua = request.headers.get("user-agent") || "";
  if (AI_BOTS.some((bot) => ua.includes(bot))) {
    return new Response("Blocked", { status: 401 });
  }
};

export const config = { path: "/*" };
```

Netlify recommends using _both_ a `robots.txt` and an Edge Function since
`robots.txt` alone is advisory. Their docs call this the ["double up"][]
approach.

### GitHub Pages

GitHub Pages is the most limited option here. It's a purely static hosting
platform — no server configuration, no `.htaccess`, no edge functions, no WAF.

Your options are:

1. **robots.txt** — Add a `robots.txt` file to the root of your repo. GitHub
   Pages will serve it. This is your only server-side tool.

2. **Meta tags** — Add `<meta name="robots" content="noai, noimageai">` to your
   HTML templates.

3. **Put Cloudflare in front** — Point your custom domain's DNS at Cloudflare
   (free tier), and you unlock all of Cloudflare's bot blocking, AI Labyrinth,
   managed `robots.txt`, and WAF rules. This is the move if you're serious about
   bot protection on GitHub Pages.

Honestly, if bot protection matters to you and you're on GitHub Pages, adding
Cloudflare as a proxy is the single highest-leverage thing you can do.

## Citations

1. <a id="1" href="https://tollbit.com/state-of-the-bots/q3-q4-2025/"> State of
   the Bots </a>
2. <a id="2" href="https://radar.cloudflare.com/year-in-review/2025#ai-traffic-share">
   AI Bot Traffic 2025 </a>
3. <a id="3" href="https://radar.cloudflare.com/ai-insights?dateRange=52w#crawl-to-refer-ratio">
   Cloudflare AI Insights </a>
4. <em>Since I use Cloudflare extensively(and you should too, their free-tier is
   amazing), I'll mostly be focusing on their service offerings.</em>
5. <a id="5" href="https://www.rfc-editor.org/rfc/rfc9309"> RFC 9309 </a>

[ai.robots.txt]: https://github.com/ai-robots-txt/ai.robots.txt
[AI Labyrinth]: https://blog.cloudflare.com/ai-labyrinth/
[Cloudflare blocks AI bots by default]:
  https://www.technologyreview.com/2025/07/01/1119498/cloudflare-will-now-by-default-block-ai-bots-from-crawling-its-clients-websites/
[Cloudflare Free]: https://www.cloudflare.com/plans/free/
[Dark Visitors]: https://darkvisitors.com/
[DeviantArt in 2022]:
  https://www.foundationwebdev.com/2022/11/noai-noimageai-meta-tag-how-to-install/
["double up"]:
  https://developers.netlify.com/guides/blocking-ai-bots-and-controlling-crawlers/
[manage your robots.txt]:
  https://blog.cloudflare.com/control-content-use-for-ai-training/
[Netlify Edge Functions]:
  https://docs.netlify.com/build/build-with-ai/block-ai-crawlers/
[robots.txt]: https://www.cloudflare.com/learning/bots/what-is-robots-txt/
[RFC 9309]: https://www.rfc-editor.org/rfc/rfc9309
[Tollbit]: https://tollbit.com/
[User Agent Blocker]:
  https://developers.netlify.com/guides/blocking-ai-bots-and-controlling-crawlers/
