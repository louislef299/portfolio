# start the hugo development server
serve: init
    hugo serve

# initialize git submodules for themes and data
init:
    git submodule update --init --recursive

# build the site with drafts enabled
build:
    hugo build -D

# lint and auto-fix markdown content
lint:
    markdownlint --fix -c .markdownlint.json glob content/**

# run lighthouse CI audits (requires bun: https://bun.sh)
lighthouse: build
    bunx @lhci/cli autorun
