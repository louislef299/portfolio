<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<content>
	<p>
		No surprise, but my brother and I made our annual surf trip to San Diego this year. This time, I
		decided to see what life was like with more of the locals in Ocean Beach as opposed to the
		tourist-heavy Pacific Beach/La Jolla.
	</p>

	<h2>Listing out the activites we did</h2>

	<h3>Friday 1/10</h3>
	<p>
		Flew out around 3PM CST and had a whole row to ourselves. Flew in at 5PM Pacific time. Ubered
		to the hostel and checked in. Then we went to the BBQ place and watched the Texas vs Ohio State
		game(Ohio won).
	</p>

	<h3>Saturday 1/11</h3>
	<p>
		Day one of the trip and there were some growing pains with the hostel. Lots of snoring, so
		didn't really get a ton of sleep, but woke up around 6:30AM and just went to OB coffee roasters.
		Super cool place, the wifi just sucked in the back and I eventually just called the Madre and
		said what's up.
	</p>
	<p>
		We actually we to Newbreak prior to surfing because I was hungry. I also wanted to show Henry
		the waves. I got a croissant and Henry got one too but without the aioli.
	</p>
	<p>
		After that, Henry joined me at the coffee shop and we went back, grabbed our wetsuits and hit
		the surf. We were both super out of shape and just worked on our pop-ups in the white water. The
		waves were pretty strong right by the pier, and since we were new to the spot, we just kind of
		accepted that we wouldn't make it out to the surf with out foamies and enjoyed trying to catch
		waves in the whitewater.
	</p>
	<p>
		Then, we just kinda walked around and explored OB a bit. Walked all the way to north OB and then
		settled with eating at the OB Surf Shed right by our hostel, lol. We watched the game a bit
		while we ate and then went back to the hostel and finished watching the wolves game(tough loss).
		Then called it early.
	</p>

	<h3>Sunday 1/12</h3>
	<p>OB Coffee in the morning?</p>
	<p>
		Beach day watching the Bills and hitting Newbreak for breakfast. Explored the different spots of
		OB by starting closer to the pier and eventually moving to the jetty on the north side. Had a
		super fun sunset surf session and then Henry and I watched the sunset. Then, we went back to the
		BBQ place actually and watched the Commanders vs the Buccaneers game, which was super fun to
		watch.
	</p>

	<h3>Monday 1/13</h3>
	<p>
		This morning went right to La Jolla and got and expensive breakfast at Shorehouse Kitchen. Super
		good food, can't complain. Then, we went kayaking at Everyday California in the La Jolla Cove.
		Super fun.
	</p>
	<p>
		We Ubered back around 3PM and went for a night surf that evening. Don't surf at low tide, I
		might have messed up my foot. Then we watched the Vikings suck at a pizza brewery in OB and we
		just called it early.
	</p>

	<h3>Tuesday 1/14</h3>
	<p>
		This morning I went to an espresso bar and then Henry and I started surfing around 9:30AM this
		morning. I hobbled my way to the jetty and we got into the line-up. There were some solid waves,
		probably 5-8ft waves, but Henry and I weren't quite ready for that, so we hit the waist-high
		sloping waves closer to the jetty. Then, we cleaned up, and made our way up to Encinidas to see
		the Sophies.
	</p>
	<p>
		The public transport was pretty fun on the way up and it took us ~1h30 to get there by
		bus/trolly. We met up with them at the state beach, walked around a bit and got a bite at Fish
		101. Afterwards, we went up to their place, chatted and had a drink and saw Shu &amp; Shaun.
		Then around 8:30 H and I had to dip and made our way back, finally getting back around 10:30.
	</p>

	<h3>Wednesday 1/15</h3>
	<p>
		Had to say goodbye to Lance as it was "too cold" for him in California. Hit Newbreak for
		breakfast and now I'm all caught up.
	</p>

	<img
		src="/image/travel/ob-jan2025/h-and-e-ob.jpeg"
		alt="Henry and Elise"
		loading="lazy"
	/>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
