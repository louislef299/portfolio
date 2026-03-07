---
title: "Block the Bots"
date: 2026-03-06T18:07:37-06:00
draft: false
toc: true
tags:
- secops
- web
- ai
- cloudflare
---

<!-- markdownlint-disable MD033 MD013 -->

## The Crawl Ratio Problem

Here's a fun stat: in mid-2025, OpenAI's crawl-to-referral ratio was roughly
**1,700:1**. Anthropic's? **73,000:1**. That means for every 73,000 pages
Anthropic's crawler scraped, it sent _one_ visitor back. Compare that to
traditional search engines, where the implicit deal has always been "we crawl
your content, we send you traffic." AI crawlers broke that deal.

Meanwhile, Cloudflare reports that AI crawlers generate **over 50 billion
requests per day** across their network — nearly 1% of all web traffic. That's
not a rounding error. That's an industry.

So let's talk about what you can do about it.

## Layer 1: robots.txt (The Polite Ask)

The first line of defense is `robots.txt` — a plaintext file at the root of your
site that tells crawlers what they can and can't access. It follows [RFC 9309][]
and has been the de facto standard since the mid-90s.

Check out my minimal example targeting the most common `#AI Crawlers`:
[/robots.txt](/robots.txt).

The problem? **This list is already out of date.** New crawlers pop up
constantly, and some don't even identify themselves honestly. The
[ai-robots-txt][] community project on GitHub maintains a comprehensive list,
and [Dark Visitors][] (now Known Agents) offers a dynamically-updated
`robots.txt` that tracks new crawlers as they appear.

But the fundamental issue remains:

{{< block-bots-l1 >}}

A well-behaved bot reads your `robots.txt` and moves on. A poorly-behaved bot
treats it like a suggestion. You need enforcement.

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

If you're behind Cloudflare (and if you're hosting a personal site, [you
probably should be][Cloudflare Free] — the free tier is excellent), you've got
the most options.

**One-click AI bot blocking:**

Navigate to **Security > Bots** in your dashboard and toggle **Block AI Scrapers
and Crawlers**. That's it. This has been used by over one million Cloudflare
customers since its launch. As of mid-2025, [Cloudflare blocks AI bots by
default][] for new domains — the first major infrastructure provider to do so.

You can also fine-tune this with **AI Crawl Control**, which lets you allow or
block specific crawlers individually rather than blanket-blocking everything.

**Managed robots.txt:**

Cloudflare can also [manage your robots.txt][] for you, keeping it current as
new crawlers emerge. You can scope it to only block on pages with ads or apply
it site-wide.

**AI Labyrinth (the fun one):**

This is Cloudflare's most creative defense. When [AI Labyrinth][] detects an
unauthorized crawler, instead of blocking it, it lures the bot into a maze of
AI-generated decoy pages:

{{< block-bots-l3 >}}

The links to the labyrinth are invisible to humans but visible in the HTML —
acting as a honeypot. Any visitor that goes multiple links deep into the maze is
almost certainly a bot, which gives Cloudflare data to fingerprint and catalog
bad actors. It's available on all plans including free, and it's opt-in via a
single toggle.

As PC Gamer memorably put it: _"No real human would go four links deep into a
maze of AI-generated nonsense."_

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

## The Full Stack

Here's the layered approach, from least to most aggressive:

{{< block-bots-full-stack >}}

No single layer is bulletproof. Bots can spoof user agents, ignore `robots.txt`,
and strip meta tags from scraped content. But stacking these layers creates
meaningful friction, and platforms like Cloudflare are adding behavioral
detection that goes beyond user-agent strings.

The AI scraping arms race isn't slowing down. At minimum, drop a `robots.txt`
with the [ai-robots-txt][] community list and flip the switches your hosting
platform gives you. Your content is worth protecting.

[AI Labyrinth]: https://blog.cloudflare.com/ai-labyrinth/
[ai-robots-txt]: https://github.com/ai-robots-txt/ai.robots.txt
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
[RFC 9309]: https://www.rfc-editor.org/rfc/rfc9309
[User Agent Blocker]:
https://developers.netlify.com/guides/blocking-ai-bots-and-controlling-crawlers/
