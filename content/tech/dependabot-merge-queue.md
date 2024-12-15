---
title: "Dependabot Auto-Merge"
date: 2024-12-15T09:32:18-06:00
draft: false
---

In this post, I'm just going to go through [automating dependabot updates][] and
leveraging [merge queue][] so that I don't have to mess around with rebasing and
conflicts. Hoping this will just work natively, but let's try it out!

The project I spend the most time keeping up-to-date is [aws-sso][], so this
should make my life easier by only needing to execute the release. Side note: I
really should write a doc on how to use that tool.

## Research

Alright, so after a little research, I quickly realized that merge queues [aren't
supported for personal repositories][Medium GH Actions].

> Firstly, you need to have a repository that is either a private repository in
> a GitHub Enterprise-licensed organization or a public repository in any
> organization. Personal repositories don’t support that feature at all, even
> public ones or if you have a Pro subscription.

So, that changed up the approach a bit. Simplified things a little bit.

The action ended up looking a bit like the following:

```yaml
---
name: Dependabot Automation
on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    env:
      PR_URL: ${{ github.event.pull_request.html_url }}
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
    - name: Dependabot metadata
      id: metadata
      uses: dependabot/fetch-metadata@v2.2.0
      with:
        github-token: "${{ secrets.GITHUB_TOKEN }}"
    - name: Enable auto-merge for Dependabot PRs
      run: gh pr merge --auto --merge "$PR_URL"
```

[automating dependabot updates]:  https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions
[aws-sso]: https://github.com/louhttps://github.com/louislef299/aws-ssoislef299/aws-sso
[Medium GH Actions]: https://medium.com/@kojoru/how-to-set-up-merge-queues-in-github-actions-59381e5f435a
[merge queue]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue
