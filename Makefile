.DEFAULT_GOAL := serve

serve:
	hugo serve

build:
	hugo build

lint:
	markdownlint --fix -c .markdownlint.json glob content/**

