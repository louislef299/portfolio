.DEFAULT_GOAL := serve

serve:
	git submodule update --init --recursive
	hugo serve

build:
	hugo build

lint:
	markdownlint --fix -c .markdownlint.json glob content/**

.PHONY: serve build lint
