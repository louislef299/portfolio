import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Compiles all Svelte components into a single IIFE bundle (components.js)
// that Hugo loads via a <script> tag. Each component self-registers as a
// custom HTML element (Web Component), so Hugo shortcodes just emit the tag.
export default defineConfig({
  plugins: [
    svelte({
      // Tells the Svelte compiler to output custom elements instead of
      // normal Svelte components. Each .svelte file declares its tag name
      // via <svelte:options customElement="tag-name" />.
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    // Output into Hugo's static directory so it gets served as-is.
    outDir: "../static/js",

    // CRITICAL: don't wipe the output directory — it already contains
    // d3, datamaps, topojson, and other JS files used by the site.
    emptyOutDir: false,

    lib: {
      entry: "src/main.ts",
      name: "Components",
      // Fixed filename so Hugo's <script> tag always points to the same path.
      fileName: () => "components.js",
      // IIFE = single self-executing script, works with a plain <script> tag.
      // No module loader needed, compatible with all browsers.
      formats: ["iife"],
    },
  },
});
