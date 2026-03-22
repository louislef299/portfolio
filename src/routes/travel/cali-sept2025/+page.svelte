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
	<img
		src="/image/travel/cali-sept2025/cash-and-dan.JPG"
		alt="Cash and Dan"
		style="float:left;margin-right:3%;margin-bottom:1%;width:50%;height:60%;"
		loading="lazy"
	/>

	<p>
		Just got back from a great road trip from San Francisco to San Diego with my friends Dan and
		Cash. It was so much fun from watching the Gophers lose to kicking it with
		<a href="https://www.instagram.com/rudiesrockespresso/">Rudie</a> at his coffee shop to getting
		hammered by a sunset surf in San Diego, this trip was truly unforgettable.
	</p>

	<p>
		When I landed in San Francisco on that first Friday, my friend Luke who lived there was nice
		enough to pick me up and we went right to a Taco Bell Cantina to catch up over some beers and a
		taco. One of the nicest views I'd ever had at a tbell! But he was telling me all about the
		startup that he was a part of after he had left Anduril and it was a blast hearing about the
		high-octane tech life in Silicon Valley.
	</p>

	<p>
		Another highlight of San Francisco had to have been this Brazilian Cafe;
		<a href="https://www.cafedecasa.com/">Cafe de Casa</a>. If you go, please do yourself a favor
		and get the Rosca de Coco. It was one of the best rolls I'd ever had.
	</p>

	<p>
		When we were driving from Monterey, we had to check out Big Sur. It was too bad that the 1 was
		closed about halfway through the drive(which Rudie had to tell us meant we missed the best
		parts), but we were able to stop at Pfeiffer Beach and it would really be a treat to go back
		there. It felt a lot like some of the national parks Elise and I had just been to on our Jackson
		Hole trip with all of the cabin stays you could rent out.
	</p>

	<p>
		The whole time the music we were playing was awesome. Lots of alt and indie that was played. I
		tried to capture the vibe with a little bit of my own taste in there:
	</p>

	<iframe
		style="border-radius:12px"
		src="https://open.spotify.com/embed/playlist/5nhVsvxYxIaKkNDIdSmhvJ?utm_source=generator"
		width="100%"
		height="352"
		frameborder="0"
		allowfullscreen=""
		allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		loading="lazy"
		title="California Road Trip Playlist"
	></iframe>

	<p>
		This whole trip was a blessing to share some of my favorite spots in California that I had
		discovered when I did my 3 month solo road trip back in 2022. Coming back, it felt like home as
		I had been to San Diego and Oceanside multiple times at this point and had really fallen in love
		with Northern Cali when I was road tripping.
	</p>

	<img
		src="/image/travel/cali-sept2025/surfing-pfeiffer.gif"
		alt="Surfing Pfeiffer"
		style="float:right;margin-left:3%;margin-bottom:1%;width:40%;height:40%;"
		loading="lazy"
	/>

	<p>
		Luckily, I had traveled with my 6'6" board and was able to get a lot better at actually catching
		waves with it(no footage of me actually catching a wave lol) and my time on my prone
		paddleboard back home had paid off. My timing and wave positioning were much better and I was
		catching a lot more waves with a lot less board. Now, I just need to work on my edges and start
		carving up the wave a bit more... I'm thinking I'll try to snowboard a bit more this winter to
		get some practice. All eyes are up north this winter too to try and catch some waves on superior.
		Maybe I'll create a wave report for the site or something...
	</p>

	<p>
		Anyways, having Cash and Dan on the trip was perfect. A small enough group where we could easily
		agree on things to do and chill guys that would go with the flow of my from-the-hip travel
		planning style.
	</p>

	<img
		src="/image/travel/cali-sept2025/la-skyline.JPG"
		alt="LA Skyline"
		loading="lazy"
	/>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
