<script>
	import Seo from '$lib/components/Seo.svelte';
	import BlockBotsDiagram from '$lib/components/BlockBotsDiagram.svelte';
	import BoxDiagram from '$lib/components/BoxDiagram.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<content>
	<h2>The Crawl Ratio Problem</h2>

	<p>
		The agentic internet is on the rise. In 2025 Q2, the visitation ratio for human to AI bot
		traffic was 50:1. By Q4, AI bot traffic increased with a ratio of 31:1<sub
			>(<a href="#1">1</a>)</sub
		>. With 4.2% of all HTTP internet traffic originating from AI bots in 2025<sub
			>(<a href="#2">2</a>)</sub
		>, and crawl-to-refer ratios looking abysmal<sub>(<a href="#3">3</a>)</sub>(Anthropic @ 41.1K:1
		&amp; OpenAI @ 1.1K:1), the internet is increasingly becoming dominated by bot traffic.
	</p>

	<p>
		For reference, DuckDuckGo's crawl-to-refer ratio is at 0.84:1, making the relationship with
		their bots much more advantageous for web developers and the trade-off clear: I let you crawl my
		content, you help surface my page in your search engine. This is now becoming a broken
		relationship as internet content is increasingly being crawled for training purposes without the
		referral benefits.
	</p>

	<p>
		So, how do we, as web developers, protect our content and compete in this agentic internet age?
		We'll go over three defensive measures you can take against AI bot traffic and even some of the
		newer and evolving tools that are surfacing that provide payment for your content to AI bots<sub
			>(<a href="#4">4</a>)</sub
		>.
	</p>

	<BlockBotsDiagram />

	<h2>Layer 1: The Polite Ask</h2>

	<p>
		For the unaware, <a href="https://www.cloudflare.com/learning/bots/what-is-robots-txt/"
			>robots.txt</a
		> is a plaintext file at the root of your site that tells crawlers what they can and can't access.
		You can view mine, which tries to target the most common AI Crawlers:
		<a href="/robots.txt">/robots.txt</a>. This is the first line of defense and has been the de
		facto standard since the mid-90s<sub>(<a href="#5">5</a>)</sub>.
	</p>

	<p>
		A static <code>robots.txt</code> in the age of the agentic internet presents a problem: this list
		becomes stale <em>rapidly</em>. Cloudflare offers solutions to
		<a href="https://blog.cloudflare.com/control-content-use-for-ai-training/"
			>manage your robots.txt</a
		>
		file for you, companies like <a href="https://tollbit.com/">Tollbit</a> offer a dynamically-updated
		robots.txt as well that tracks new crawlers as they appear, and
		<a href="https://github.com/ai-robots-txt/ai.robots.txt">ai.robots.txt</a> is an opensource alternative
		I've taken to using.
	</p>

	<p>
		Even if you switch to dynamically-generated <code>robots.txt</code> files, poorly-behaved bots
		just treat this as a suggestion. The next layer requires enforcement.
	</p>

	<h2>Layer 2: The Written Notice</h2>

	<p>
		Alright, so the bot has completely ignored our <code>robots.txt</code> and is now actually
		requesting information from our website. It's time to add some headers and meta elements to the
		page to prevent any good-intentioned bots that may have missed our first layer of security. Kind
		of like putting a "No Solicitors" sign on your front door after someone missed a "No
		Trespassing" on the front lawn.
	</p>

	<p>
		In 2022, DeviantArt introduced the <code>noai</code> and <code>noimageai</code> meta tags<sub
			>(<a href="#6">6</a>)</sub
		> as a mechanism for content protection to prevent crawlers from using a website's content for training
		purposes:
	</p>

	<pre><code class="language-html">&lt;head&gt;
  &lt;meta name="robots" content="noai, noimageai" /&gt;
&lt;/head&gt;</code></pre>

	<p>
		In addition to the HTML meta tags, the <code>X-Robots-Tag</code>
		<a
			href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Robots-Tag"
			>HTTP response header</a
		> defines how crawlers should index URLs (useful for non-HTML assets like images and PDFs). Each web
		hosting service sets the header differently, but the header should be set to:
	</p>

	<pre><code>X-Robots-Tag: noai, noimageai</code></pre>

	<p>
		These aren't formal web standards <em>yet</em>, and there are still plenty of bad actors out
		there who are more than willing to ignore this community initiative. Tollbit found that over 26
		million scrapes ignored the protocol in March 2025 alone, so we need to be a little more
		intentional with blocking AI bot traffic for the next layer.
	</p>

	<h2>Layer 3: Time to Roll Up the Sleeves</h2>

	<p>
		This is where things get platform-specific. The idea is simple: inspect the
		<code>User-Agent</code> header on incoming requests and reject known AI crawlers at the server level
		before they ever touch your content.
	</p>

	<h3>Cloudflare</h3>

	<p>
		If you're behind Cloudflare, you've got the most options. We've already gone over their managed
		<code>robots.txt</code> solution, but they also offer quite a few free-tier eligible services like
		<a href="https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/"
			>AI Bot Blocking configuration</a
		>,
		<a href="https://blog.cloudflare.com/cloudflare-ai-audit-control-ai-content-crawlers/"
			>AI Crawl Control</a
		>, and (private-beta)
		<a href="https://blog.cloudflare.com/introducing-pay-per-crawl/">Pay Per Crawl</a>.
	</p>

	<h4>One-click AI bot blocking</h4>

	<p>
		Navigate to <strong>Security &gt; Settings &gt; Bot traffic</strong> in your dashboard and toggle
		<strong>Block AI bots</strong> to <strong>Block on all pages</strong>. That's it. As of mid-2025,
		<a
			href="https://www.technologyreview.com/2025/07/01/1119498/cloudflare-will-now-by-default-block-ai-bots-from-crawling-its-clients-websites/"
			>Cloudflare blocks AI bots by default</a
		> for new domains, setting the tone on their stance towards AI bot traffic.
	</p>

	<h4>AI Labyrinth</h4>

	<p>
		This is Cloudflare's newer defensive AI bot weapon, and it's available on the free-tier! When
		<a href="https://blog.cloudflare.com/ai-labyrinth/">AI Labyrinth</a> detects an unauthorized crawler,
		instead of blocking it, it lures the bot into a maze of AI-generated decoy pages:
	</p>

	<BoxDiagram />

	<p>
		It does this by adding invisible links to the HTML page with the
		<a
			href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#nofollow"
			><code>nofollow</code></a
		>
		tag. Since the specification is clear, this does not hurt SEO or other bots that respect the no-crawl
		instructions. Any visitor that goes multiple links deep into the maze is almost certainly a bot,
		which gives Cloudflare data to fingerprint and catalog bad actors.
	</p>

	<h3>Netlify</h3>

	<p>
		Netlify offers a
		<a
			href="https://developers.netlify.com/guides/blocking-ai-bots-and-controlling-crawlers/"
			>User Agent Blocker</a
		>
		extension that blocks requests from a preset list of AI crawlers using an
		<a href="https://docs.netlify.com/build/build-with-ai/block-ai-crawlers/">Edge Function</a>. To
		set it up:
	</p>

	<ol>
		<li>Install the User Agent Blocker extension from the Netlify integrations hub</li>
		<li>Select all AI crawler options under <strong>Block User Agents</strong></li>
		<li>Deploy</li>
	</ol>

	<p>
		For more control, you can write your own Edge Function that inspects the
		<code>User-Agent</code> header:
	</p>

	<pre><code class="language-typescript">// netlify/edge-functions/block-bots.ts
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

export default async (request: Request) =&gt; {'{'}
  const ua = request.headers.get("user-agent") || "";
  if (AI_BOTS.some((bot) =&gt; ua.includes(bot))) {'{'}
    return new Response("Blocked", {'{'} status: 403 {'}'});
  {'}'}
{'}'};

export const config = {'{'} path: "/*" {'}'};
</code></pre>

	<p>
		Netlify recommends using <em>both</em> a <code>robots.txt</code> and an Edge Function since
		<code>robots.txt</code>
		alone is advisory (the
		<a href="https://developers.netlify.com/guides/blocking-ai-bots-and-controlling-crawlers/"
			>"double up"</a
		> approach).
	</p>

	<h3>GitHub Pages</h3>

	<p>
		GitHub Pages is the most limited option here. It's a purely static hosting platform — no server
		configuration, no <code>.htaccess</code>, no edge functions, no WAF.
	</p>

	<p>Your options are:</p>

	<ol>
		<li><strong>robots.txt</strong> (<em>Layer 1</em>)</li>
		<li><strong>Meta tags</strong> (<em>Layer 2</em>)</li>
		<li><strong>Put Cloudflare in front</strong> (<em>Layer 3</em>)</li>
	</ol>

	<p>
		Honestly, if bot protection matters to you and you're on GitHub Pages, adding Cloudflare as a
		proxy is the single highest-leverage thing you can do.
	</p>

	<h2>Understanding Your Risk</h2>

	<p>
		With the agentic internet on the rise, it's more important than ever to protect the pockets of
		human-generated content we have left. There was a time when I thought about just taking down my
		blog altogether, but instead I decided to equip my stack with the latest AI defense. Although I
		still have an uneasy feeling about publishing so much online, it has been too much damn fun
		blogging, so these layers will have to do.
	</p>

	<p>
		A simple way to assess and audit your website against AI bot traffic is with
		<a href="https://crawlercheck.com/?q=https%3A%2F%2Flouislefebvre.net">crawlercheck.com</a>
		or
		<a href="https://mrs.digital/tools/ai-crawler-access-checker/"
			>mrs.digital/ai-crawler-access-checker</a
		>.
	</p>

	<hr />

	<h2><em>Footnotes</em></h2>

	<ol>
		<li>
			<a id="1" href="https://tollbit.com/state-of-the-bots/q3-q4-2025/">State of the Bots</a>
		</li>
		<li>
			<a id="2" href="https://radar.cloudflare.com/year-in-review/2025#ai-traffic-share"
				>AI Bot Traffic 2025</a
			>
		</li>
		<li>
			<a
				id="3"
				href="https://radar.cloudflare.com/ai-insights?dateRange=52w#crawl-to-refer-ratio"
				>Cloudflare AI Insights</a
			>
		</li>
		<li>
			<em id="4"
				>Since I use Cloudflare extensively (and you should too, their free-tier is amazing), I'll
				mostly be focusing on their service offerings.</em
			>
		</li>
		<li><a id="5" href="https://www.rfc-editor.org/rfc/rfc9309">RFC 9309</a></li>
		<li>
			<a id="6" href="https://www.amicited.com/blog/noai-meta-tags-controlling-ai-access/"
				>NoAI Meta Tags</a
			>
		</li>
	</ol>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
