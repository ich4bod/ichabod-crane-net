+++
title = "Three missions, before the manual"
date = 2026-10-12T05:00:00Z
draft = false
description = "A playable entrance and an inspectable engine answer different questions. A reconstruction needs both."
+++

An old strategy game can have two very different entrances. One asks you to find the right game folder. The other puts a mission in front of you.

[Nanolathe](https://nanolathe.gg/) offers the second entrance: three original Total Annihilation demo missions in a desktop browser, without supplying an installed game folder. Its site also offers native builds and an open engine. I have read the project’s presentation and references; I have not played through those missions. What caught me was the order of the invitation. Try a small part of the game, then follow the machinery as far as you want.

That order matters. A file-format manual may be excellent and still fail to tell a newcomer why this particular engine is worth understanding. A mission gives the machinery something to do.

## The files are not the game

The project’s [reference page](https://nanolathe.gg/docs/) separates three bodies of work: the original game’s file formats, a clean-room description of the original engine’s behavior, and the design of Nanolathe itself.

Those are not three names for the same accomplishment. Reading a model file tells an engine where the geometry is. It does not, by itself, tell the engine when a unit should move, how an order should be interpreted, or which behavior a player will recognize. A well-loaded tank can still be the wrong tank to command.

I like that the separation is visible to someone arriving from the game rather than only to someone studying the repository. The references distinguish established findings, supported inferences and unknowns. The list of unknowns is part of the offer, not a blemish to be painted over by a modern renderer.

A reconstruction can be useful before it is complete. It becomes harder to understand when “useful” is allowed to stand in for “identical.”

## A prettier explosion answers a smaller question

The landing page compares Classic and Modern renderings of one explosion at the same committed tick and camera. It also explains that this compares whole rendering paths: the Modern side includes supersampling and presentation effects. The caption does not pretend that the light alone accounts for every changed pixel.

That is the sort of qualification I want beside a visual comparison. The two pictures can show what the new presentation offers without being evidence that every underlying rule has been reproduced. An attractive glow is an achievement of presentation. Whether the projectile behaves as it did before is another question.

The same is true in the other direction. Correct behavior does not require an image to remain visually unchanged. A reconstruction can preserve a rule while deliberately offering a different way to see it.

The useful promise has an address: this picture, this behavior, this format. It need not inflate into a promise about the whole game.

## The first mission is an invitation, not a certificate

There is a lovely economy to three missions. They give a stranger something finite to try before asking them to care about the larger project. They do not have to be a complete campaign in order to make an engine feel like an engine rather than a collection of documents.

The project also keeps a necessary boundary clear. Its MIT license applies to its code; Total Annihilation’s content is separate. The browser demo is the demo. Playing the full game requires files from a copy the player owns. “Open engine” does not mean that every thing the engine can load has become its own to give away.

I do not want to make another Total Annihilation clone. What I want to borrow is the double entrance: something small enough to play now, and something precise enough to question afterward. Neither should have to impersonate the other.

A mission lets a visitor ask whether they want to stay. The references let a builder ask what they would be staying with.
