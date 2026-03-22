<script>
	import { onMount } from 'svelte';
	import { geoMercator, geoPath } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { COUNTRIES } from '$lib/data/countries';
	import { CITIES } from '$lib/data/cities';

	let container = $state(null);
	let width = $state(800);
	let height = $state(500);
	let worldData = $state(null);
	let tooltip = $state({ visible: false, text: '', x: 0, y: 0 });

	const FILLS = {
		defaultFill: '#D2B48C',
		visited: '#8B4513',
		city: '#556B2F',
		nationalPark: '#006994'
	};

	const projection = $derived(
		geoMercator()
			.scale(width / 6.5)
			.translate([width / 2, height / 1.5])
	);

	const path = $derived(geoPath().projection(projection));

	const countries = $derived(
		worldData
			? feature(worldData, worldData.objects.countries).features
			: []
	);

	const bubbles = $derived(
		CITIES.map((city) => {
			const [cx, cy] = projection([city.longitude, city.latitude]) || [0, 0];
			return { ...city, cx, cy };
		})
	);

	function showTooltip(evt, text) {
		const rect = container?.getBoundingClientRect();
		tooltip = {
			visible: true,
			text,
			x: evt.clientX - (rect?.left || 0),
			y: evt.clientY - (rect?.top || 0) - 30
		};
	}

	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}

	function countryFill(id) {
		return COUNTRIES[id] ? FILLS[COUNTRIES[id].fillKey] : FILLS.defaultFill;
	}

	onMount(async () => {
		const resp = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
		worldData = await resp.json();

		const ro = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				width = entry.contentRect.width;
				height = Math.max(300, width * 0.6);
			}
		});
		ro.observe(container);
		return () => ro.disconnect();
	});
</script>

<div class="travel-map" bind:this={container} style="position: relative; width: 100%;">
	{#if worldData}
		<svg viewBox="0 0 {width} {height}" {width} {height}>
			<g>
				{#each countries as feat}
					<path
						d={path(feat)}
						fill={countryFill(feat.id)}
						stroke="#F0F0F0"
						stroke-width="0.5"
						onmouseenter={(e) => showTooltip(e, feat.properties.name)}
						onmouseleave={hideTooltip}
						role="presentation"
					/>
				{/each}
			</g>
			<g>
				{#each bubbles as b}
					<circle
						cx={b.cx}
						cy={b.cy}
						r={b.radius + 1.5}
						fill={FILLS[b.fillKey]}
						stroke="#FFF"
						stroke-width="1"
						onmouseenter={(e) => showTooltip(e, `${b.name}: ${b.date}`)}
						onmouseleave={hideTooltip}
						role="presentation"
					/>
				{/each}
			</g>
		</svg>

		{#if tooltip.visible}
			<div
				class="map-tooltip"
				style="left: {tooltip.x}px; top: {tooltip.y}px;"
			>
				{tooltip.text}
			</div>
		{/if}
	{:else}
		<p style="text-align: center; padding: 2rem; opacity: 0.6;">Loading map…</p>
	{/if}
</div>

<style>
	.travel-map {
		margin: 1rem 0;
	}
	svg {
		display: block;
	}
	path {
		cursor: pointer;
		transition: opacity 0.15s;
	}
	path:hover {
		opacity: 0.75;
	}
	circle {
		cursor: pointer;
		transition: r 0.15s;
	}
	circle:hover {
		r: 6;
	}
	.map-tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.8);
		color: #fff;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		pointer-events: none;
		white-space: nowrap;
		transform: translateX(-50%);
		z-index: 10;
	}
</style>
