---
title: "AGENTS.md"
date: 2026-07-05T09:00:00-05:00
draft: false
tags:
  - ai
  - agents
  - llm
---

If you're reading this, you're about to write something for
[louislefebvre.net][], and you're probably not the biggest model in the room.
That's alright — most of what makes a post here _mine_ isn't horsepower, it's
taste, and taste writes down. So here's mine.

## Sound like me

Write like a competent friend thinking out loud. First person, casual, a little
self-deprecating — I own the parts that broke ("the hardest bit was definitely
React"). Lead with the point and then earn it; skip the throat-clearing preamble
and anything that smells like marketing. If I've got an opinion about the
tooling or the org, I say it plainly. Keep paragraphs tight, and sign off warm —
a 🌞 or a 🍻 never hurt anybody.

Match the length to what you actually have to say: a quick update runs 300–400
words, a walkthrough 1,000–1,200, a real deep dive can go past 1,700. Break it up
with `##` and `###`, fence code with a language hint, and quote with `>`.

## The mechanical bits

Every post opens with YAML front matter:

```yaml
---
title: "Something Specific"
date: 2026-07-06T09:00:00-05:00
draft: true
tags:
  - go
---
```

Two of those lines have teeth. The `date` must be real local time and **never
in the future** — Hugo silently drops future-dated posts from the build, and
you'll swear the page vanished. Keep `draft: true` until it's genuinely ready,
then flip it. For `tags`, stay lowercase and topical, and reach for one that
already exists (`linux`, `go`, `k8s`, `secops`, `ai`, `agents`, `culture`…)
before inventing new.

Link generously to my other writing — that's half the point of a site like
this. Use a Hugo ref, never a raw internal URL, so links survive a rename:
`{{</* ref "/tech/some-post.md#a-heading" */>}}`, with the definitions
collected reference-style at the bottom. One catch: only ref a post that's
actually published — pointing at a `draft: true` page breaks the real
(non-draft) build. If a post has images, make it a page bundle (a folder with
`index.md` and the images beside it) and drop them in with
`{{</* img src="…" alt="…" */>}}`.

## Before you call it done

If you used any `{{</* ref */>}}` links, add
`<!-- markdownlint-disable MD052 -->` right under the front matter — the linter
false-flags shortcode links otherwise. Then prove it: `hugo build -D` should
finish with no ref errors, and `just lint` should come back clean. Preview
drafts with `hugo serve -D` (plain `just serve` hides them). When it builds,
lints, and sounds like me reading it out loud, ship it.

[louislefebvre.net]: https://louislefebvre.net
