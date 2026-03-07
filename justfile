default: serve

init:
    git submodule update --init --recursive

serve: init
    hugo serve

build:
    hugo build -D

lint:
    markdownlint --fix -c .markdownlint.json glob content/**
