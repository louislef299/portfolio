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
		For those who have been following along since the beginning, I've written about bluetooth a few
		times now(<a href="/tags/ble/">#ble</a>) and each time I learned a bit more, the space felt
		complex and difficult to actually create a functional system with. Well, the past few months
		I've been learning <a href="https://www.swift.org/">swift</a> in my free
		time(<a href="https://github.com/louislef299/boot">boot</a>) and have had to adapt to the
		expressiveness that swift provides.
	</p>

	<p>
		Although the swift programming language has a bit more of a learning curve than golang, the
		<a href="https://developer.apple.com/bluetooth/">bluetooth capabilities</a> are much more
		mature than go. Albeit go was never supposed to be an embedded/mobile language to begin with, it
		is nice to know that this was the right investment of time.
	</p>

	<p>
		So, this post will introduce bluetooth programming in swift. If you're new to swift, I've found
		the <a href="https://developer.apple.com/tutorials/develop-in-swift">develop in swift</a>
		tutorials to be quite a bit of help. Due to my love of O'Reilly books, I had to peruse through
		<a href="https://www.oreilly.com/library/view/learning-swift-3rd/9781491987568/"
			>Learning Swift</a
		>, but I will say I stopped reading about halfway through mostly because I bought an addition
		that was a year old and it tried to walk me through storyboards instead of swiftUI...
		<a
			href="https://medium.com/@mertaydogn0/swiftui-vs-storyboard-a-comprehensive-analysis-for-ios-development-edb8ec8ee566"
			>stay away from storyboards</a
		>.
	</p>

	<p>
		<a
			href="https://developer.apple.com/documentation/uikit/displaying-and-managing-views-with-a-view-controller"
			>model-view-controller</a
		>
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
