.DEFAULT_GOAL := dev

dev:
	git submodule update --init --rebase
	@trap 'kill 0' EXIT; \
	bun run build:dev & \
	sleep 1; \
	hugo serve -D --disableFastRender & \
	wait

build:
	bun run build:prod
	hugo --gc --minify

lint:
	markdownlint --fix -c .markdownlint.json glob content/**

.PHONY: dev serve build build-hugo lint
