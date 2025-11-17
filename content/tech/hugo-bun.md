---
title: "Hugo + Bun"
date: 2025-11-04T00:08:57-06:00
draft: true
tags:
- hugo
- bun
---

This post will be about compiling bun and hugo and going over my choice on
filesystem structure & CI/CD. For this experiment, I'm going to try and make an
interactive map myself. The idea here is that it will replace the existing
javascript I currently have and tune it up a bit. This should open the
possibility in my web development journey to build interactive applications run
on the browser.

This won't be a post introducing javascript, typescript or bun, so feel free to
familiarize yourself quick to help make this post more helpful.

## Filesystem Structure

After considering several options, I went with a **Modern Hybrid** approach that
keeps Hugo and Bun sources separate while coordinating their builds. Here's the
structure:

```bash
portfolio/
├── config/          # Hugo configuration
├── content/         # Blog posts and pages (markdown)
├── layouts/         # Hugo templates
├── static/          # Static assets served by Hugo
│   ├── data/        # JSON data files (cities, countries)
│   ├── js/          # Compiled JavaScript bundles (Bun output)
│   ├── css/         # Stylesheets
│   └── image/       # Images
├── src/             # TypeScript source code
│   ├── main.ts      # Entry point (bundled by Bun)
│   ├── map/         # Map visualization code
│   │   ├── index.ts # Map implementation (Leaflet)
│   │   └── types.ts # TypeScript interfaces
│   └── lib/         # Utility functions
│       └── data-fetcher.ts
├── public/          # Hugo build output (generated)
├── package.json     # Bun dependencies and scripts
├── tsconfig.json    # TypeScript strict mode config
├── netlify.toml     # CI/CD configuration
└── Makefile         # Build orchestration
```

### Why This Structure?

1. **Clean separation** - Hugo content lives in `content/`, TypeScript code
   lives in `src/`
2. **Static data** - Travel data (cities/countries) as JSON files fetched at
   runtime
3. **Type safety** - Full TypeScript strict mode with proper interfaces
4. **Modern tooling** - Using Leaflet instead of D3/Datamaps for better
   TypeScript support
5. **Build coordination** - Makefile orchestrates both Bun and Hugo builds

### Development Workflow

The `Makefile` includes a `dev` target that runs both Bun and Hugo in parallel:

```makefile
dev:
    @trap 'kill 0' EXIT; \      # Kill all child processes on Ctrl+C
    bun run build:dev & \       # Run Bun in watch mode (background)
    sleep 2; \                  # Wait for initial TypeScript build
    hugo serve [...] & \        # Run Hugo server (background)
    wait                        # Keep target alive until interrupted
```

**Key techniques:**

- **`&`** - Runs each command in the background
- **`trap 'kill 0' EXIT`** - Ensures both processes terminate cleanly on Ctrl+C
- **`sleep 2`** - Gives Bun time to complete initial build before Hugo starts
- **`wait`** - Blocks until all background jobs finish (or are interrupted)

When you run `make dev`:

1. Bun starts watching `src/` and rebuilds to `static/js/main.js` on any changes
2. Hugo serves the site on `localhost:1313` with hot-reloading
3. Both processes run simultaneously - edit TypeScript or content, see changes immediately
4. Press Ctrl+C once to stop both cleanly

### Production Build

For production (Netlify), the build happens sequentially:

```bash
bun install && bun run build:prod && hugo --gc --minify
```

This ensures:

1. Dependencies are installed
2. TypeScript is bundled and minified to `static/js/`
3. Hugo builds the optimized static site with the bundled JavaScript included

### Available Make Commands

- **`make dev`** (default) - Development environment with hot-reloading
- **`make serve`** - Hugo server only (original workflow)
- **`make build`** - Production build (Bun + Hugo sequentially)
- **`make build-hugo`** - Hugo build only
- **`make lint`** - Lint markdown files

## Old vs New

Currently active (old):

- Datamaps library rendering to #map1
- Cities and countries as global JS variables (CITIES, COUNTRIES)
- Loaded via custom_head.html and js_map.html shortcode

Ready but unused (new):

- TypeScript/Bun compiled to main.js
- Modern async/await data fetching
- Leaflet integration (commented out, marked TODO)
- Type-safe interfaces

Next steps would be: implementing the actual Leaflet map logic in
src/map/index.ts, creating HTML templates that load main.js, and
switching from the old Datamaps setup.

---

## Getting to Copy Code Button

Learning Path: Copy Code Button

  Phase 1: Understanding the DOM

  Goal: Learn to find and manipulate HTML elements from TypeScript

  Concepts to research:

- document.querySelector() and document.querySelectorAll()
- What are NodeLists vs Arrays?
- How to target elements with CSS selectors (e.g., pre code, .highlight)
- Element.closest() for finding parent elements

  Mini-exercise: Write a script that logs all code blocks on your page to the console

  ---
  Phase 2: Creating & Inserting Elements

  Goal: Dynamically add buttons to your page

  Concepts to research:

- document.createElement() to make new elements
- Setting attributes: element.setAttribute(), element.className, element.id
- Inserting elements: appendChild(), insertBefore(), insertAdjacentElement()
- Where should the button go? (inside pre tag? after it? absolutely positioned?)

  Mini-exercise: Create a button element and add it next to each code block (don't
  worry about functionality yet)

  ---
  Phase 3: Event Handling

  Goal: Make buttons respond to clicks

  Concepts to research:

- addEventListener() for click events
- Event object and event.target
- Arrow functions vs regular functions in event listeners (what does this refer to?)
- Event delegation (optional: one listener vs many)

  Mini-exercise: Make your buttons log "clicked!" when pressed

  ---
  Phase 4: Clipboard API

  Goal: Actually copy text to clipboard

  Concepts to research:

- navigator.clipboard.writeText() - the modern way
- Promises and async/await (the clipboard API is asynchronous)
- Error handling with try/catch
- Fallback methods for older browsers (optional)
- Getting text content: textContent vs innerText vs innerHTML

  Mini-exercise: Make the button copy the code block's text to clipboard

  ---
  Phase 5: User Feedback

  Goal: Show "Copied!" confirmation

  Concepts to research:

- Changing button text dynamically
- setTimeout() to revert text after delay
- CSS classes and classList.add(), classList.remove()
- CSS transitions for smooth feedback
- Preventing multiple rapid clicks (optional)

  Mini-exercise: Show "Copied!" for 2 seconds, then change back to "Copy"

  ---
  Phase 6: TypeScript Types

  Goal: Add proper type safety

  Concepts to research:

- DOM element types: HTMLElement, HTMLButtonElement, HTMLPreElement
- Type assertions with as or type guards
- Handling null values (elements might not exist)
- NodeListOf<T> type for querySelectorAll results

  Mini-exercise: Add type annotations to all your variables and function parameters

  ---
  Phase 7: Bun Integration

  Goal: Bundle your TypeScript for production

  Concepts to research:

- How Bun resolves imports and modules
- Entry points (your src/main.ts)
- The --minify and --sourcemap flags in your build script
- Where Hugo expects static assets (static/js/)
- Including the bundled script in your Hugo templates

  Mini-exercise: Import your copy-button code into main.ts and run bun build

  ---
  Phase 8: Hugo Integration

  Goal: Load your script on appropriate pages

  Concepts to research:

- Hugo's layouts/ directory structure
- Where to add <script> tags in templates
- DOMContentLoaded event (when to run your code)
- Conditional loading (only on pages with code blocks?)

  ---
  Bonus Challenges (once basics work):

- Support syntax highlighting libraries (Prism, Highlight.js)
- Copy only visible code (handle line numbers separately)
- Keyboard shortcut support
- Mobile-friendly positioning
- Accessibility: ARIA labels, keyboard navigation

  Debugging Tips to Research:

- Browser DevTools Console
- Network tab to verify script loads
- Elements tab to inspect generated HTML
- Breakpoints in Sources tab
