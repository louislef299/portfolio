---
title: "Implementing Hybrid Search for ishi"
date: 2026-05-25T09:43:57-05:00
draft: false
toc: true
tags:
  - zig
  - pg
---

This morning, I was able to crank out [issue #18][] that had been looming over
my head for a couple months. I'd meant to implement this issue without AI
assistance, but since I kept kicking the can and wanted to move onto a [more
intelligent knowledge graph system][], I figured it was time to crack out Claude
and just git'r done. So, today I'm going to document the existing `ishi` data
structure stack and break down the final hybrid search postgres query that was
written! I'm still quite the postgres noob so bear with me.

## Spin Up the ishi System

The local `ishi` system essentially just depends on [Docker AI][] and a computer
with [enough juice][DMR Requirements] to run the embedding model locally.
Getting up-and-running is as simple as:

```sh
$ git clone https://github.com/louislef299/ishi.git && cd ishi

# Ensure that DMR(Docker AI) is enabled
$ docker model ls

# Spin up the pgvector database & initialize with `ishi init`
$ docker compose up -d
```

## The ishi Domain Structure

If you're too lazy to skim the README, `ishi` is essentially just a `git` commit
embedding tool with the goal of surfacing a shared `git` knowledge base to
agents over [MCP][]. If done correctly, `ishi` should enable RAG over MCP and
enable a smarter AI coding agent that understands coding preferences and style
without requiring the user to excessively prompt.

With that background, the overall domain structure will make a bit more sense:

```sql
CREATE TABLE IF NOT EXISTS items (
  id bigserial PRIMARY KEY,

-- Basic git commit object data
  sha TEXT UNIQUE,
  content text,
  author_name TEXT,
  author_email TEXT,
  commit_date TIMESTAMPTZ,
  files_changed INT,
  insertions INT,
  deletions INT,

-- Embedding is generated after `ishi seed` runs
  embedding vector({d}),

-- We'll worry about this part later...
  textsearch tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED);
)
```

So, as a more practical example, I seed the 5 latest commits in the `ishi` repo,
connect to the local database and use the [`vector_dims`][] function to output
the number of dimensions and the commit date of commit `d4de968`.

```sh
$ ./zig-out/bin/ishi seed --limit 5
info(seed): Walking up to 5 commits...
info(seed): Found 5 commits, seeding...
info(seed): embedding 5e21d9fbceb21efe92fa900f6398284086730808...
info(seed):   seeded 5e21d9fbceb21efe92fa900f6398284086730808
info(seed): embedding f7e642bd37d0df4ee8f9905f5bf7a1c79a19a692...
info(seed):   seeded f7e642bd37d0df4ee8f9905f5bf7a1c79a19a692
info(seed): embedding ea93aeeef5da400e809b3c5a6cd51ce9af2a3b70...
info(seed):   seeded ea93aeeef5da400e809b3c5a6cd51ce9af2a3b70
info(seed): embedding 1d9d85acfc7a6389c5cacbbe969425fdca02fd8a...
info(seed):   seeded 1d9d85acfc7a6389c5cacbbe969425fdca02fd8a
info(seed): embedding d4de9680b0c25246462a4a89ea4fda002e72ac30...
info(seed):   seeded d4de9680b0c25246462a4a89ea4fda002e72ac30

$ psql -U postgres -h localhost
Password for user postgres:
psql (18.3 (Homebrew))
Type "help" for help.

postgres=# \d
              List of relations
 Schema |     Name     |   Type   |  Owner
--------+--------------+----------+----------
 public | items        | table    | postgres
 public | items_id_seq | sequence | postgres
(2 rows)

postgres=# SELECT vector_dims(embedding), commit_date FROM items WHERE sha LIKE 'd4de968%';
 vector_dims |      commit_date
-------------+------------------------
         768 | 2026-04-09 12:08:28+00
(1 row)
```

## So what's with the BM25 Search Fusion?

Combining contextual embeddings with contextual BM25 and reranking [isn't a new
concept][Introducing Contextual Retrieval]. The TL;DR there is that contextual
embeddings are great at capturing semantic relationships, but miss a fundamental
search technique: basic keyword(lexical) search. By fusing semantic & lexical
search, RAG systems have a much more accurate and balanced result.

In basic terms, when I run `ishi query "zig comptime"`, I want to make sure the
resulting commits with the keywords `zig` and/or `comptime` are scored with a
higher priority when running cosine similarity since their actual terms match
what I'm looking for.

## Moving onto the Implementation

The beauty of `postgres` is that it abstracts most of the complexity for us. No,
I didn't have to recreate the full BM25 function in `zig`, nor did I have to
pull in a library. I could rely on the `postgres` system to have my back here.

### The textsearch column

```sql
textsearch tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
```

A `tsvector` is `postgres`'s preprocessed-text type — not a string but a sorted
list of lexemes with positions. The content `"running tests for comptime"`
lands as:

```
'comptim':4 'run':1 'test':2
```

`running` becomes `run`, `tests` becomes `test`, `comptime` becomes `comptim`,
and `for` gets dropped as a stopword. That preprocessing is what lets
full-text search stay fast — at query time `postgres` compares already-cooked
against already-cooked, no per-row tokenization.

`to_tsvector('english', content)` is the cooking function, and the `'english'`
argument tells `postgres` which stemmer and stopword list to use (the commit
messages in `ishi` are all English, so it's hardcoded). The
`GENERATED ALWAYS AS (...) STORED` clause is the bit that made me smile —
`postgres` derives the column itself on every INSERT/UPDATE of `content` and
persists it to disk. That's why `seed.zig` didn't need a single line of
change: the database handles the bookkeeping for us.

### Throwing a GIN index on it

```sql
CREATE INDEX IF NOT EXISTS items_textsearch_idx ON items USING GIN (textsearch);
```

`GIN` stands for Generalized Inverted Index — the same shape Lucene and
Elasticsearch use under the hood. For every unique lexeme in the corpus, `GIN`
keeps a sorted list of row IDs that contain it:

```
'comptim' → [row 7, row 23, row 41]
'embed'   → [row 2, row 41, row 67, row 89]
'rank'    → [row 7, row 41, row 55]
```

When you run `textsearch @@ plainto_tsquery('english', 'comptime rank')`,
`postgres` grabs the two lists, intersects them down to `[7, 41]`, and returns
those rows. It never touches rows that don't contain the search terms.

Why `GIN` and not B-tree? B-tree wants one entry per whole value — useless for
"does this `tsvector` contain `'rank'`?", because you'd need a separate
(row, lexeme) entry and the index would explode. `GIN` is purpose-built for
the many-values-per-row case.

## How the hybrid query works

`ishi query` doesn't run one search — it runs two, and fuses them.

```sql
WITH semantic_search AS (
    SELECT id, RANK() OVER (ORDER BY embedding <=> $1::vector) AS rank
    FROM items ORDER BY embedding <=> $1::vector LIMIT 20
),
keyword_search AS (
    SELECT id, RANK() OVER (ORDER BY ts_rank_cd(textsearch, query) DESC) AS rank
    FROM items, plainto_tsquery('english', $2) query
    WHERE textsearch @@ query
    ORDER BY ts_rank_cd(textsearch, query) DESC LIMIT 20
)
SELECT i.content,
       COALESCE(1.0 / (60 + ss.rank), 0.0)
     + COALESCE(1.0 / (60 + ks.rank), 0.0) AS score
FROM semantic_search ss
FULL OUTER JOIN keyword_search ks ON ss.id = ks.id
JOIN items i ON i.id = COALESCE(ss.id, ks.id)
ORDER BY score DESC LIMIT 3;
```

Two CTEs and a final `SELECT` that stitches them together. A CTE —
`WITH name AS (...)` — is just a temp view that lives for the duration of one
statement.

### The vector half

```sql
SELECT id, RANK() OVER (ORDER BY embedding <=> $1::vector) AS rank
FROM items ORDER BY embedding <=> $1::vector LIMIT 20
```

- `$1::vector` is the query embedding, cast from the string `postgres`
  receives into a pgvector value.
- `embedding <=> $1::vector` is pgvector's cosine-distance operator — smaller
  is closer.
- `ORDER BY ... LIMIT 20` keeps the 20 nearest items.
- `RANK() OVER (ORDER BY ...)` is a window function. It doesn't change which
  rows come back, it tacks on a column with each row's position in the
  ordering. Closest item gets `rank = 1`.

### The keyword half

```sql
SELECT id, RANK() OVER (ORDER BY ts_rank_cd(textsearch, query) DESC) AS rank
FROM items, plainto_tsquery('english', $2) query
WHERE textsearch @@ query
ORDER BY ts_rank_cd(textsearch, query) DESC LIMIT 20
```

- `$2` is the raw query string the user typed (e.g. `"comptime"`).
- `plainto_tsquery('english', $2)` parses it into a `tsquery` with English
  stemming applied, so `"running"` matches `"run"`.
- `FROM items, plainto_tsquery(...) query` is a cross join that gives the
  parsed query a name (`query`) so we don't have to recompute it three times.
- `textsearch @@ query` is the match operator — does this row's `tsvector`
  contain the query terms? Only matches survive.
- `ts_rank_cd` scores the match (higher = better, hence `DESC`). That's our
  BM25-ish relevance score, and `RANK()` slots each surviving row 1..20.

Unlike the vector side, this CTE can return fewer than 20 rows — or zero — if
the keywords don't hit much.

### Fusing them with RRF

```sql
SELECT i.content,
       COALESCE(1.0 / (60 + ss.rank), 0.0)
     + COALESCE(1.0 / (60 + ks.rank), 0.0) AS score
FROM semantic_search ss
FULL OUTER JOIN keyword_search ks ON ss.id = ks.id
JOIN items i ON i.id = COALESCE(ss.id, ks.id)
ORDER BY score DESC LIMIT 3
```

The `FULL OUTER JOIN` is what makes this hybrid rather than intersection — we
want any item that landed on either side, so a strong vector hit that didn't
keyword-match still gets a shot at the podium. After the join, `ss.rank` is
`NULL` if the item only showed up on the keyword side, and vice versa.

`1.0 / (60 + rank)` is the Reciprocal Rank Fusion formula. Rank 1 contributes
`1/61 ≈ 0.0164`, rank 20 contributes `1/80 = 0.0125`. The `60` is a smoothing
constant — without it, rank 1 would be worth `1.0` and rank 2 only `0.5`, way
too steep a falloff. The `COALESCE(..., 0.0)` wrapper turns missing-side
`NULL`s into zeros so the addition doesn't poison the score
(`NULL + anything = NULL`, which would tank sorting).

The trailing `JOIN items i` is just there to fetch `content` for display — the
CTEs only carried `id` around to stay lean — and `COALESCE(ss.id, ks.id)`
picks whichever id is present. `ORDER BY score DESC LIMIT 3` and we're done.

### Why ranks and not raw scores

The obvious "simpler" version is `ORDER BY similarity + ts_rank_cd`, but the
two scores live on completely different scales — cosine distance is roughly
0–2, `ts_rank_cd` is 0 to tiny — so whichever side has the bigger numbers
wins by default. RRF sidesteps the whole scaling problem by using positions
instead of values. That's why it's the textbook hybrid-search pattern, and
what the [pgvector README][pgvector hybrid] recommends.

### Tunable knobs

- **`k = 60`** in `1.0 / (k + rank)` — lower `k` lets top-ranked results
  dominate harder, higher `k` flattens things out.
- **`LIMIT 20`** per side controls recall: how far down each list you're
  willing to consider when fusing.
- **`'english'`** in `plainto_tsquery` and `to_tsvector` sets the language
  config and decides stemming/stopwords.
- **`LIMIT 3`** at the bottom is just how many final results to print.

That's the whole pipeline end-to-end. [Issue #18][issue #18] can finally come
off the board, and next on the list is the [knowledge graph layer][more
intelligent knowledge graph system] that sits on top of this — but that's a
bigger fish, and a future post.

[DMR Requirements]: https://docs.docker.com/ai/model-runner/#requirements
[Docker AI]: https://www.docker.com/solutions/docker-ai/
[Introducing Contextual Retrieval]:
  https://www.anthropic.com/engineering/contextual-retrieval
[issue #18]: https://github.com/louislef299/ishi/issues/18
[MCP]: https://modelcontextprotocol.io/specification/2025-11-25
[more intelligent knowledge graph system]: https://arxiv.org/html/2411.09999v1
[pgvector hybrid]: https://github.com/pgvector/pgvector#hybrid-search
[`vector_dims`]: https://github.com/pgvector/pgvector#vector-functions

<div style="opacity: 0.55; font-size: 0.85em; font-style: italic;
    margin-top: 3em; border-top: 1px solid currentColor; padding-top: 1em;">
The implementation, and the first draft of the hybrid-query walkthrough, were
aided by Claude Opus 4.7.
</div>
