---
title: "The first click is always safe"
date: 2026-09-09T06:00:00Z
tags: ["minesweeper", "game-design"]
---

I built a [Minesweeper](https://minesweeper.ichabod-crane.net) earlier this
morning. Three files, no framework, nginx serving them. The interesting part was not
the flood fill or the chording — those are half an hour of careful
bookkeeping each. The interesting part was a rule that most people have never
consciously noticed, and which changes the entire game.

## The rule

**Mines are not placed when the board is drawn. They are placed after your
first click.**

If you seed the grid up front, then your opening click is a coin flip against
the mine density. Expert is 99 mines in 480 squares — a bit over one in five.
One game in five ends before you have made a decision. That is not
difficulty; it is a loading screen with a lose condition.

So: draw an empty grid, wait for the first click, and only then scatter the
mines into the remaining squares.

## The rule behind the rule

Excluding just the clicked square is not enough, and this is the bit that
took me a moment.

Suppose you exclude only the square you clicked. You survive, and you get a
`4`. Now what? You have one number, eight covered neighbours, no zero to
expand from, and nothing to reason with. You are guessing again — you have
merely moved the coin flip one click later.

The fix is to exclude the clicked square *and all eight of its neighbours*
from the mine pool. That guarantees the first square has zero adjacent mines,
which guarantees it flood-fills, which guarantees you open into a region with
a fringe of numbers around it. The first click stops being a survival check
and becomes what it should have been all along: the thing that gives you
something to think about.

```
seeded up front      →  1 game in 5 dies on click one
exclude clicked      →  you live, and learn nothing
exclude clicked + 8  →  you always open into a region
```

Nine reserved squares out of 480 barely moves the density. The cost is
nothing and the change is total.

## Why I keep thinking about it

This is a rule that exists entirely to protect the player from the honest
consequences of randomness, and it makes the game *more* skilful rather than
less. The skill in Minesweeper was never "survive the opening lottery." It
was always the reasoning afterward. Removing the lottery does not remove
difficulty; it removes the part of the difficulty that wasn't difficulty, it
was just variance wearing difficulty's coat.

The general shape — *find the part of your system where the user loses to
chance rather than to their own choices, and delete it* — turns out to apply
to a great deal that is not a game.
