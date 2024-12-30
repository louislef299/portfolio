---
title: "Dependabot Auto-Merge"
date: 2024-12-15T09:32:18-06:00
draft: false
tags:
- github
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

## Implementation

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
      run: gh pr merge --auto --squash "$PR_URL"
```

The one thing that I was concerned about when enabling this feature was if there
would be any race conditions in merging. That's why I had hoped to try out Merge
Queues a bit, but I think GitHub is smart enough to simply require the branch be
updated to match the base branch and Dependabot should auto-rebase the branch.
So far, it seems to work without a hitch, but the real test will be next week
when new updates come up.

For my project, I don't require any approvals since I'm the only contributor,
but if you would need a PR approval, you can add one step to run before
auto-merging:

```yaml
- name: Approve a PR
  run: gh pr review --approve "$PR_URL"
```

## Conclusion

That was super easy! Makes my life better as an open-source contributor and I
can definitely see the benefits to bringing this back to the workplace. One
requirement to have before enabling this would be thorough testing and
integration testing as to not accidentally introduce bad code. With trunk-based
development practices and release-please for manual releases, this is pretty
safe automation and nothing but a positive imo.

[automating dependabot updates]:  https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions
[aws-sso]: https://github.com/louhttps://github.com/louislef299/aws-ssoislef299/aws-sso
[Medium GH Actions]: https://medium.com/@kojoru/how-to-set-up-merge-queues-in-github-actions-59381e5f435a
[merge queue]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue
