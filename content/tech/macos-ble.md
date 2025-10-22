---
title: "macOS BLE"
date: 2025-10-21T21:12:19-05:00
draft: true
tags:
- ble
- swift
- macos
---

For those who have been following along since the beginning, I've written about
bluetooth a few times now([#ble](/tags/ble)) and each time I learned a bit more,
the space felt complex and difficult to actually create a functional system
with. Well, the past few months I've been learning [swift][] in my free
time([boot][]) and have had to adapt to the expressiveness that swift provides.

Although the swift programming language has a bit more of a learning curve than
golang, the [bluetooth capabilities][] are much more mature than go. Albeit go
was never supposed to be an embedded/mobile language to begin with, it is nice
to know that this was the right investment of time.

So, this post will introduce bluetooth programming in swift. If you're new to
swift, I've found the [develop in swift][] tutorials to be quite a bit of help.
Due to my love of O'Reilly books, I had to peruse through [Learning Swift][],
but I will say I stopped reading about halfway through mostly because I bought
an addition that was a year old and it tried to walk me through storyboards
instead of swiftUI... [stay away from storyboards][].

[model-view-controller][]

[bluetooth capabilities]: https://developer.apple.com/bluetooth/
[boot]: https://github.com/louislef299/boot
[develop in swift]: https://developer.apple.com/tutorials/develop-in-swift
[Learning Swift]: https://www.oreilly.com/library/view/learning-swift-3rd/9781491987568/
[model-view-controller]: https://developer.apple.com/documentation/uikit/displaying-and-managing-views-with-a-view-controller
[stay away from storyboards]: https://medium.com/@mertaydogn0/swiftui-vs-storyboard-a-comprehensive-analysis-for-ios-development-edb8ec8ee566
[swift]: https://www.swift.org/
