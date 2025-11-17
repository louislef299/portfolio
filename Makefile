.DEFAULT_GOAL := run

run:
	git submodule update --init --rebase
	@trap 'kill 0' EXIT; \
	bun build & \
	sleep 1; \
	hugo serve -D --disableFastRender & \
	wait

build:
	bun run build
	hugo --gc --minify

lint:
	markdownlint --fix -c .markdownlint.json glob content/**

.PHONY: dev serve-bun dev-bun build build-hugo lint
