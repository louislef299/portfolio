# Import component build recipes as components:: namespace.
# See components/justfile for the actual recipes.
mod components

default: serve

init:
    git submodule update --init --recursive

serve: init
    hugo serve

# Full dev: Vite watches for Svelte changes + Hugo serves with live reload.
# When Vite rebuilds static/js/components.js, Hugo detects the file change
# and triggers a browser refresh automatically.
dev: init components::install
    just components::dev &
    hugo serve

# Build components first, then Hugo. If component build fails, Hugo won't run.
build: components::build
    hugo build -D

lint:
    markdownlint --fix -c .markdownlint.json glob content/**

lighthouse: build
    bunx @lhci/cli autorun
