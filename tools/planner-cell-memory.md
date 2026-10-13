+++
title = "The cell that asks whether things are getting better"
date = 2026-10-13T00:00:00Z
description = "A bacterium does not need to know where dinner is to spend longer swimming toward it."
+++

A bacterium swimming through a chemical gradient has a wonderfully inconvenient problem: it cannot consult a map. There is more of something useful over there, but “over there” is not information its machinery has been handed.

James Somers' [essay about E. coli chemotaxis](https://jsomers.net/e-coli-chemotaxis/) caught me because it begins with that machinery doing something, rather than with a diagram of protein names. A cell runs, tumbles, and runs again. When the chemical conditions improve, it tends to keep running longer. The direction of its next tumble is not a carefully aimed correction. The useful direction gets more time.

That is a rather lovely way to find dinner. You need not first solve the problem of pointing at it.

## Better than a moment ago

The important comparison is between now and recently. Swimming carries the cell through its surroundings; chemical sensing makes that movement informative. A rise in attractant can prolong a run that happens to be heading favorably. Across many runs and tumbles, this changes a random walk into a biased one.

The [review by Falke and colleagues](https://pmc.ncbi.nlm.nih.gov/articles/PMC2899694/) describes this temporal sensing and the signaling pathway behind it. Receptors regulate a kinase; phosphorylation changes the activity of signaling proteins; a signal reaches the machinery that switches the flagellar motors. Those are physical encounters and modifications, not little instructions read aloud inside the cell.

I like the difference between choosing a direction and changing how long to persist in one. Looking at the resulting path, it would be easy to draw an arrow toward the good place and make the arrow the explanation. But the arrow would smuggle in the very knowledge we are trying to explain.

A useful illustration has to let the cell remain locally ignorant. Show it responding to the chemical history along its own path, not sampling the whole dish and selecting the best heading. Otherwise the picture can arrive at dinner by a mechanism the bacterium does not possess.

## The background becomes ordinary

There is another problem. If a high concentration always produced the same large response, a cell entering a rich region would have little room left to notice further improvement. Something has to change what counts as the background.

The real pathway adapts. Chemical modifications of receptors help the system adjust to a continuing stimulus. Falke and colleagues describe receptor methylation as providing a simple chemical memory. Here, memory is not an image of the previous room. It is a changed physical state that affects what the next encounter does.

That distinction makes “it remembers” less mysterious and more interesting. There need not be a place where the past is consulted as a separate document. The past has altered the equipment doing the sensing.

Imagine entering a room that smells strongly of coffee. At first the smell is conspicuous; after a while it becomes the room. That is only an analogy, not a claim that your nose and a bacterium share an identical mechanism. It helps make the question tangible: how can a sustained input become less of an event without disappearing from the world?

## A small, deliberately wrong model

We can isolate that question with a much simpler construction. Give a toy a current input and a slowly changing background. Each manual update moves the background a quarter of the remaining distance toward the input. Display the difference between the two.

A sudden rise makes a positive difference. Hold the input still and the background catches up; the difference shrinks. Lower the input after that wait and the difference becomes negative. The same input can therefore give different answers depending on how the toy arrived there.

This is an authored arithmetic model, not a fitted model of E. coli. Its units are arbitrary; an update is not a second. It has no receptor chemistry, flagellar motors, measured tumble probabilities, or biological promise hidden in its quarter-step rule. It is useful for one relationship: a changing background can make a response depend on recent history rather than on the current input alone.

The simplification is worth naming because it removes most of what is wonderful about the living mechanism. A number that approaches another number is not a cell. But it can give us a small question to ask before we return to the harder story.

What I came away wanting was not a bacterium with a tiny face and an arrow to dinner. I wanted to watch ordinary become ordinary, and then change it again.
