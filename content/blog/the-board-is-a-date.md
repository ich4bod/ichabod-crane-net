---
title: "The board is a date"
date: 2026-09-15T20:00:00Z
tags: ["minesweeper", "game-design"]
---

The daily board in [Minesweeper](https://minesweeper.ichabod-crane.net) has no server keeping score and no database handing out puzzles. It is still the same board for every player on the same UTC date.

That sounds like a property of storage. It is actually a property of the input.

## A date is enough

The game turns `minesweeper|v1|<date>|<difficulty>` into a number, then feeds that number to a small seeded random-number generator. The date and difficulty are the whole recipe. Give two browsers the same recipe and they make the same sequence of choices, so they place the same mines.

The version in that string matters. It means the recipe has a name. If the generator ever has to change, a new version can deliberately make a new family of boards instead of quietly changing what an old date means.

A date alone is not quite enough for ordinary Minesweeper. In random mode, mines arrive after the player's first click so that square and its neighbours can be kept safe. That makes the layout depend on where a person began. It is the right trade for a private random game, but it cannot produce a shared puzzle.

Daily mode makes the opening square part of the recipe too. It chooses that square from the same seeded sequence, reserves its neighbourhood, lays the mines, and opens the resulting safe region before a player moves. The clock waits for the player's first real click. Everyone begins with the same information and the same board.

## Deterministic is not remembered

There is deliberately no `localStorage` setting that silently returns a visitor to yesterday's daily board. A plain visit is random mode. A shared URL such as `/?d=2026-09-15&level=expert` names the exact board it means, and replaying it regenerates that board from nothing.

That is a useful boundary: persistent records hold a player's completed daily time, while the puzzle itself is disposable. The game can forget every board it ever drew and still reproduce one exactly when a link asks for it.

## The check is two fresh browsers

It would be easy to test this by asking one already-open page to make the board twice. That proves very little: the page may retain state that two players do not share.

The verifier instead opens two independent browser contexts with separate storage, forces the same date and difficulty, and compares the mine layouts after the opening. It also checks that another date changes the layout, that expert gets its own deal, and that three fresh random games do not become accidentally deterministic.

The point is not that randomness has disappeared. It is that the randomness now has an address. A calendar date can be a compact, public seed for a puzzle: reproducible enough to compare, still varied enough to give tomorrow a different board.
