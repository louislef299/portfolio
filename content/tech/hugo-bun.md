---
title: "Hugo + Bun"
date: 2025-11-04T00:08:57-06:00
draft: true
tags:
- hugo
- bun
- alpine.js
- javascript
---

This post documents my journey integrating Bun with Hugo to build interactive
JavaScript applications for my static site. After experimenting with various
approaches, I settled on a simplified JavaScript setup with Alpine.js for
reactivity, keeping things lightweight and performant.

This won't be a post introducing JavaScript, Bun, or Alpine.js, so feel free to
familiarize yourself with these tools to get the most out of this post.

## Evolution of Approach

Initially, I considered a TypeScript-based approach with complex map
visualizations. However, I quickly realized that for building simple interactive
pages, vanilla JavaScript with a lightweight framework would be more
appropriate. The goal shifted from replacing complex visualizations to creating
beautiful, interactive single pages that complement my Hugo-based site.

## Filesystem Structure

I went with a **Modern Hybrid** approach that keeps Hugo and Bun sources
separate while coordinating their builds. Here's the current structure:

```bash
portfolio/
├── config/          # Hugo configuration
├── content/         # Blog posts and pages (markdown)
├── layouts/         # Hugo templates
├── static/          # Static assets served by Hugo
│   ├── construction.html  # Standalone interactive pages
│   ├── css/               # Stylesheets
│   │   └── construction.css
│   └── js/                # Compiled JavaScript bundles (Bun output)
│       ├── alpine.js      # Alpine.js + custom components
│       └── alpine.js.map  # Source map for debugging
├── src/             # JavaScript source code
│   └── alpine.js    # Entry point with Alpine.js + components
├── public/          # Hugo build output (generated)
├── package.json     # Bun dependencies and scripts
├── netlify.toml     # CI/CD configuration
└── Makefile         # Build orchestration
```

### Why This Structure?

1. **Clean separation** - Hugo content lives in `content/`, JavaScript source in
   `src/`
2. **Minimal overhead** - No TypeScript compilation, just JavaScript bundling
3. **Static pages** - HTML pages in `static/` for standalone experiences
4. **Modern tooling** - Using Alpine.js for reactivity without the bloat
5. **Build coordination** - Makefile orchestrates both Bun and Hugo builds

## Alpine.js Integration

After evaluating several frameworks (React, Vue, Svelte, Preact), I chose
**Alpine.js** for its:

- **Tiny footprint** - ~15KB for the core library
- **Declarative syntax** - Write reactive code directly in HTML
- **No build requirement** - Works great bundled or via CDN
- **Perfect fit** - Ideal for enhancing static pages with interactivity

### Installation

```bash
bun add alpinejs
```

### Setup (src/alpine.js)

```javascript
import Alpine from 'alpinejs';

// Define reusable components
window.terminal = function() {
    return {
        currentCommand: '',
        history: [],

        init() {
            this.$refs.input.focus();
        },

        executeCommand() {
            // Command handling logic
        }
    }
};

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();
```

### Build Configuration

The `package.json` includes simple build scripts:

```json
{
  "scripts": {
    "start": "bun src/alpine.js",
    "build": "bun build src/alpine.js --outdir static/js --minify --sourcemap"
  },
  "dependencies": {
    "alpinejs": "^3.15.2"
  }
}
```

## Terminal Page Implementation

As a first interactive page, I built a terminal-style "under construction" page
with a retro aesthetic and command-line interface.

### Features

- **Black terminal background** with green monospace text
- **Interactive prompt** that accepts user commands
- **Command history** displayed above the current input
- **Auto-focus** - Click anywhere to focus the input
- **Built-in commands**: `help`, `clear`, `about`, `contact`, `date`

### HTML Structure (static/construction.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal - Under Construction</title>
    <link rel="stylesheet" href="/css/construction.css">
</head>
<body>
    <button class="back-button" @click="window.history.back()" x-data>
        ← back
    </button>

    <div class="terminal" x-data="terminal()" x-init="init()">
        <div class="terminal-header">
            <div class="terminal-output">
                <p>Welcome to the terminal.</p>
                <p>Type 'help' for available commands.</p>
            </div>
        </div>

        <div class="command-history">
            <template x-for="(item, index) in history" :key="index">
                <div class="command-history-item">
                    <div>
                        <span class="prompt">$</span>
                        <span class="command" x-text="item.command"></span>
                    </div>
                    <div class="output" x-html="item.output"></div>
                </div>
            </template>
        </div>

        <div class="prompt-line">
            <span class="prompt">$</span>
            <input
                type="text"
                class="terminal-input"
                x-model="currentCommand"
                @keydown.enter="executeCommand()"
                x-ref="input"
            >
        </div>
    </div>

    <script src="/js/alpine.js"></script>
</body>
</html>
```

### Styling Highlights

The CSS creates an authentic terminal feel:

```css
body {
    background: #000;
    color: #0f0;
    font-family: 'Courier New', Courier, monospace;
}

.terminal-input {
    background: transparent;
    border: none;
    color: #0f0;
    font-family: 'Courier New', Courier, monospace;
    outline: none;
    caret-color: #0f0;
}
```

### Component Logic

The terminal component handles commands with a simple switch statement:

```javascript
executeCommand() {
    const cmd = this.currentCommand.trim().toLowerCase();
    let output = '';

    switch(cmd) {
        case 'help':
            output = 'Available commands: help, clear, about, ...';
            break;
        case 'clear':
            this.history = [];
            this.currentCommand = '';
            return;
        // ... more commands
    }

    this.history.push({
        command: this.currentCommand,
        output: output
    });

    this.currentCommand = '';
}
```

## Development Workflow

The `Makefile` includes a `run` target that builds JavaScript and starts Hugo:

```makefile
run:
    git submodule update --init --rebase
    @trap 'kill 0' EXIT; \
    bun run build & \
    sleep 1; \
    hugo serve -D --disableFastRender & \
    wait
```

**Key techniques:**

- **`bun run build`** - Bundles JavaScript before Hugo starts
- **`&`** - Runs commands in the background
- **`trap 'kill 0' EXIT`** - Ensures both processes terminate cleanly on Ctrl+C
- **`sleep 1`** - Gives Bun time to complete the build
- **`wait`** - Blocks until all background jobs finish

When you run `make run`:

1. Git submodules are updated
2. Bun builds `src/alpine.js` to `static/js/alpine.js`
3. Hugo serves the site on `localhost:1313`
4. Both processes run simultaneously
5. Press Ctrl+C once to stop both cleanly

## Production Build

For production (Netlify), the build happens sequentially:

```bash
bun run build && hugo --gc --minify
```

This ensures:

1. JavaScript is bundled and minified to `static/js/`
2. Hugo builds the optimized static site with the bundled JavaScript included
3. All assets are optimized and ready for deployment

## Available Make Commands

- **`make run`** (default) - Build JavaScript and start Hugo dev server
- **`make build`** - Production build (Bun + Hugo sequentially)
- **`make lint`** - Lint markdown files

## Lessons Learned

### 1. Start Simple

TypeScript and complex frameworks aren't always necessary. Vanilla JavaScript
with Alpine.js provides enough structure for interactive pages without the
overhead.

### 2. Separate Concerns

Keeping HTML in `static/`, JavaScript source in `src/`, and compiled output in
`static/js/` creates a clear mental model:

- `src/` = Source code that needs building
- `static/` = Final assets served by Hugo

### 3. Alpine.js Sweet Spot

Alpine.js hits the perfect balance for Hugo sites:

- Small enough to not bloat your bundle
- Powerful enough for rich interactions
- Familiar syntax if you know Vue or React

### 4. Component Organization

Defining Alpine components in the bundled JavaScript (e.g., `window.terminal`)
keeps logic separate from HTML while remaining accessible via `x-data`.

## Next Steps

With the foundation in place, future enhancements could include:

1. **More commands** - Add interactive easter eggs, ASCII art, or mini-games
2. **Additional pages** - Build more standalone interactive experiences
3. **Shared components** - Extract common patterns into reusable Alpine
   components
4. **Progressive enhancement** - Add animations, sound effects, or visual
   effects
5. **Hugo integration** - Consider using Hugo templates for dynamic page
   generation

## Conclusion

Integrating Bun with Hugo opened up new possibilities for creating interactive
experiences on my static site. By keeping things simple with JavaScript and
Alpine.js, I've created a foundation that's easy to maintain, fast to build,
and pleasant to work with.

The terminal page serves as a proof of concept - a small, self-contained
interactive experience that demonstrates what's possible when you combine
Hugo's static site generation with modern JavaScript tooling.
