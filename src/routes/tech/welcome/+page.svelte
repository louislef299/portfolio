<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<p>
	Alright so I've slimmed things down. Going to focus more on just keeping some notes online about
	any research I do, travel and any other interests I have. I've never really been great at writing,
	but it would be great to just have a linear blog to keep track of everything I've been working on.
</p>

<p>
	Currently working at Medtronic as a platform engineer and have slowly evolved into a
	jack-of-all-trades engineer with more of a pioneer's mindset with innovation and
	business/customer buy-in before industrialization and stabilization.
</p>
