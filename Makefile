.DEFAULT_GOAL := dev

# Development: Run both Bun (watch mode) and Hugo in parallel
dev:
	@echo "🚀 Starting portfolio development environment..."
	@echo ""
	@trap 'kill 0' EXIT; \
	bun run build:dev & \
	sleep 2; \
	hugo serve --buildDrafts --disableFastRender & \
	echo ""; \
	echo "✅ Development servers running:"; \
	echo "   - Bun: watching src/ and rebuilding to static/js/"; \
	echo "   - Hugo: http://localhost:1313"; \
	echo ""; \
	echo "Press Ctrl+C to stop both servers"; \
	wait

serve:
	git submodule update --init --recursive
	hugo serve

build:
	@echo "🔨 Building TypeScript with Bun..."
	bun run build:prod
	@echo "🏗️  Building Hugo site..."
	hugo --gc --minify

build-hugo:
	hugo build -D

lint:
	markdownlint --fix -c .markdownlint.json glob content/**

.PHONY: dev serve build build-hugo lint
