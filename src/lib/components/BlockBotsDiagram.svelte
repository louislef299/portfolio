<div
	style="
		max-width: 500px;
		margin: 2rem auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	"
>
	<div
		class="bb-box"
		style="
			border-color: #1a8fe3;
			background: rgba(26, 143, 227, 0.12);
			width: 65%;
		"
	>
		<span class="bb-label" style="color: #1a8fe3">Layer 1: robots.txt + noai meta tags</span>
		<span class="bb-sub">advisory only — compliant bots respect it</span>
	</div>
	<div
		class="bb-box"
		style="
			border-color: #e8a832;
			background: rgba(232, 168, 50, 0.1);
			width: 80%;
		"
	>
		<span class="bb-label" style="color: #e8a832">Layer 2: Edge Functions / WAF Rules</span>
		<span class="bb-sub">User-Agent inspection — blocks known crawlers</span>
	</div>
	<div
		class="bb-box"
		style="
			border-color: #5b3a29;
			background: rgba(91, 58, 41, 0.15);
			width: 95%;
		"
	>
		<span class="bb-label" style="color: #8b6844">Layer 3: AI Labyrinth / Honeypots</span>
		<span class="bb-sub" style="color: #3dbdb5; opacity: 0.8"
			>active defense — waste bot resources + fingerprint</span
		>
	</div>
</div>
