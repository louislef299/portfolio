.DEFAULT_GOAL := dev

# Traditional Hugo development with live reload
dev:
	git submodule update --init --rebase
	@trap 'kill 0' EXIT; \
	bun run build:dev & \
	sleep 1; \
	hugo serve -D --disableFastRender & \
	wait

# Hybrid mode: Build Hugo once, then run Bun server with dynamic routes
serve-bun:
	@echo "Building Hugo site..."
	@hugo -D
	@echo "\nStarting Bun server..."
	@bun run serve

# Watch mode: Rebuild Hugo on changes and run Bun server
dev-bun:
	git submodule update --init --rebase
	@trap 'kill 0' EXIT; \
	bun run build:dev & \
	hugo -D -w --disableFastRender & \
	sleep 2; \
	bun run serve:watch & \
	wait

build:
	bun run build:prod
	hugo --gc --minify

lint:
	bun type-check
	markdownlint --fix -c .markdownlint.json glob content/**

.PHONY: dev serve-bun dev-bun build build-hugo lint
