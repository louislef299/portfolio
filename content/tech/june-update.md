---
title: "June Update"
date: 2025-06-23T22:49:56-05:00
draft: false
---

At work, I've been supporting our stabilization of [Backstage][], which means
that I had to learn frontend development. I've simultaneously had to learn
practical kafka streaming and Spring Boot(why can't we just move to Go
microservices?), so my learning of all the Backstage dependencies has been a
little... slow.

The new tech stack includes:

- `yarn`
- TypeScript/JavaScript
- Lerna(thrown out after I upgraded to yarn berry)
- The Backstage library
- [React][]

Funny enough, the hardest bit there for me was definitely React. In all my time
as a software engineer, I just never really spent that much time with frontend
dev. Well, never too late to try something new, and this is a good way to get a
well-rounded background for my career.

I'd been wrestling with Backstage for a little bit too long to realize that
Backstage truly is just a library. Since the task of deploying Backstage had
been given to our internal infrastructure team, nobody had any clue how to write
good frontend code. So of course we were having any of the typical growing pains
of deploying a web app that any college group would have! We have stale updates;
nobody knows when it's down; nobody even can tell me specific details about the
implementation because most of it was [vibe-coded][].

Anyways, my OCD kicked in and I just learned the whole tech stack even though I
was just supposed to be on to stabilize their kubernetes deployment strategy.

[Backstage]: https://backstage.io/
[React]: https://nextjs.org/learn/react-foundations
[vibe-coded]: https://youtu.be/Tw18-4U7mts?si=fmyh5PW6kbqWo_92
