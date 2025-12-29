---
title: "Incremental Web Design with Svelte"
date: 2025-12-28T19:25:46-06:00
draft: false
---

Winter break is a great time to refresh and clear your mind. I've been working
in operations so much, it's easy to forget that the reason I'm building these
microservice apis, designing databases and configuring cloud architectures is
just to improve user's experience on the [World Wide Web][]. This website was
created leveraging [hugo][] and importing the `clente/hugo-bearcub` theme, so a
great way to ignore front-end engineering while implementing a project that
required understanding some of the backend knowledge I'd learned.

But, I'd been curious on improving my web dev knowledge this recently  to build
an e-commerce website and wanted to dive in. My first thought(naively) was to
find out what JavaScript framework to use. I'd used react in the past and really
didn't enjoy that learning experience, then I tried Alpine.js and quickly found
the implementation to look... disgusting. 

Then a coworker mentioned they were using [svelte][] for their application and
was intrigued by the idea of it being a love-letter to web development. That
sounded an awful lot like  the promise of [zig][], so I dove in and eventually
ran across [Resilient Web Design][] and decided to try the [incremental design
approach][] with svelte.

For this example, we'll build a tab component that uses anchor links in HTML,
becomes functional with pure CSS, and gets polished with JavaScript.

## Initializing the Project

For this post, we're going to use [bun][] to initialize the [SvelteKit
project][]:

```bash
$ bunx sv create tabnav

┌  Welcome to the Svelte CLI! (v0.11.1)
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
│
◇  What would you like to add to your project? (use arrow keys / space bar)
│  none
│
◆  Project created
│
◇  Which package manager do you want to install dependencies with?
│  bun
│
│  bun x sv create --template minimal --types ts --install bun tabnav
│
◆  Successfully installed dependencies with bun
│                                                                                             ◇  What's next? ───────────────────────────────╮                                              │                                              │                                              │  📁 Project steps                            │
│                                              │
│    1: cd tabnav                              │
│    2: bun run dev --open                     │
│                                              │
│  To close the dev server, hit Ctrl-C         │
│                                              │
│  Stuck? Visit us at https://svelte.dev/chat  │
│                                              │
├──────────────────────────────────────────────╯
│
└  You're all set!
```

## The Progressive Enhancement Approach(Thanks Claude)

The core idea behind progressive enhancement is that each layer of web technology
(HTML, CSS, JavaScript) should work independently while building on the previous
layer. Content remains accessible even when higher layers fail to load or aren't
supported. This isn't about dumbing down the experience—it's about making it
resilient.

For our tab component, here's how each layer contributes:

### Layer 1: HTML (Core Functionality)

We start with semantic HTML using anchor links that point to different sections
of the page:

```html
<nav>
  <a href="#about">About</a>
  <a href="#services">Services</a>
  <a href="#contact">Contact</a>
</nav>

<section id="about">
  <h2>About</h2>
  <p>About content here...</p>
</section>

<section id="services">
  <h2>Services</h2>
  <p>Services content here...</p>
</section>

<section id="contact">
  <h2>Contact</h2>
  <p>Contact info here...</p>
</section>
```

At this layer, clicking a "tab" scrolls to that section using the browser's
native anchor behavior. All content is visible and accessible. It works with
JavaScript disabled, works with screen readers, works everywhere.

### Layer 2: CSS (Presentation + Tab Behavior)

Here's where it gets interesting—we can create functional tabs using only CSS:

```css
/* Style the tab navigation */
nav {
  display: flex;
  border-bottom: 2px solid #ccc;
}

nav a {
  padding: 1rem;
  text-decoration: none;
}

/* Hide all sections by default */
section {
  display: none;
  padding: 2rem;
}

/* Show the targeted section using the :target pseudo-class */
section:target {
  display: block;
}

/* Show first section by default if nothing is targeted */
section:first-of-type:not(:target) {
  display: block;
}
```

The `:target` pseudo-class is the magic here—it matches an element when the URL
hash points to it. Click "Services" and the URL becomes `#services`, so only the
services section displays. We now have a fully functional tab interface with
**zero JavaScript**.

### Layer 3: JavaScript (Enhanced UX)

Finally, JavaScript adds polish and improved interaction:

```javascript
function enhanceTabs() {
  const tabs = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('section');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault(); // Don't jump or change URL

      // Hide all sections with fade out
      sections.forEach(s => s.classList.remove('active'));

      // Show clicked section with fade in
      const target = document.querySelector(tab.getAttribute('href'));
      target.classList.add('active');

      // Update active tab indicator
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Keyboard navigation with arrow keys
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Navigate between tabs
    }
  });
}
```

This layer provides smooth fade/slide animations, prevents URL changes for a
cleaner experience, adds keyboard navigation, and creates a more polished feel.
But if this JavaScript fails to load or encounters an error, users still have
working tabs via CSS.

## Building with Svelte

[bun]: https://bun.com/docs/guides/ecosystem/sveltekit
[hugo]: https://gohugo.io/
[incremental design approach]: https://resilientwebdesign.com/chapter5/
[svelte]: https://svelte.dev/docs/svelte/overview
[SvelteKit project]: https://svelte.dev/docs/kit/project-structure
[Resilient Web Design]: https://resilientwebdesign.com/
[World Wide Web]: https://en.wikipedia.org/wiki/World_Wide_Web
[zig]: https://ziglang.org/
