+++
title = "The percentage has to earn its name"
date = 2026-10-11T00:00:00Z
draft = false
description = "Choosing an answer, sounding certain, and being right are three different achievements."
+++

A percentage is a remarkably persuasive costume for an opinion.

“Cave” sounds like a guess about where to find a bat. “99.78% cave” sounds as though someone has gone out, counted the bats, and brought back a notebook. The extra digits seem to supply the missing fieldwork.

They need not.

In [Nish Tahir’s experiment with a small language model](https://nishtahir.com/build-your-own-decision-model/), the question is where you would most likely find a bat. The offered answers include a cave, a baseball game, an attic, a zoo and a sporting goods store. The model puts almost all its allowed-answer probability on the cave. But the question has not told us whether this bat flies or gets swung.

I do not think that example establishes a single correct distribution over the five answers. It establishes something more useful: the confidence-looking number has answered a narrower question than the reader may assume.

## A fenced answer is still an answer

Tahir’s method gives the model five permitted answer tokens. It takes the scores for those tokens and normalizes them into probabilities. The model cannot wander off into a paragraph or choose an answer outside the list.

That is a useful constraint. It makes the output easy to consume. It does not make the winning answer true.

And there is a further distinction inside the percentage. Normalizing over the permitted answers measures how those answers compete under this setup. It does not, by itself, establish how often the chosen answer will be correct. Changing the fence can change what a share means. If the right answer is missing from the list, one of the wrong ones still wins.

This is not a reason to stop using constrained answers. It is a reason to avoid giving a formatting achievement the name of an epistemic one.

## Ninety out of a hundred

A well-calibrated forecaster has a particular obligation. Among comparable predictions assigned ninety percent confidence, roughly ninety percent should turn out right.

That is a statement about a collection of predictions and their outcomes. It is not a guarantee that this one prediction will succeed. Nor does a forecast of seventy percent become dishonest merely because the event fails to happen. Failure was part of what it predicted.

Tahir reports a striking gap in his evaluation. In the highest confidence bin, the average confidence was about 98.6 percent while accuracy was about 70.1 percent. Those are his reported experimental results, not a measurement I have reproduced. Still, the distinction they illustrate is clear: a model can rank an answer decisively and be much less reliable than its numbers suggest.

The interesting question is no longer “Does this number look confident?” It is “What happened to the other predictions carrying numbers like this?”

## Change the confidence, not the winner

[Chuan Guo and colleagues’ 2017 paper on calibration](https://proceedings.mlr.press/v70/guo17a.html) studied this problem in neural-network classifiers. They found temperature scaling surprisingly effective on most of the datasets they examined. That is a reported result for their experiments, not a universal promise for every classifier or language model.

Temperature scaling divides the answer scores by one positive temperature before converting them to probabilities. Raising that temperature flattens the distribution. It can make a formerly overwhelming favorite less overwhelming without changing which answer ranks first.

I like how unheroic this repair is. It does not claim to teach the model a missing fact. It changes what its certainty claims.

The temperature has to be fitted against labeled examples, and checked on examples that were not used to choose it. Otherwise we have only found a flattering description of the data already in hand. A good fit for one kind of question is not an automatic warranty for another.

## Let the number keep its modest job

There are at least three achievements here: returning an allowed answer, choosing the right answer, and attaching a probability that deserves to be read as a probability of correctness.

A system can accomplish the first while failing at the second. It can improve the third without changing a single winning answer. Keeping those achievements separate makes the tool more interesting, not less.

I would rather see a plain label saying “share among the allowed answers” than a beautiful gauge called “confidence” that has never met an outcome. And when someone has done the calibration work, I want to know what kinds of questions earned that label.

The percentage does not need to disappear. It needs to tell us which notebook, if any, it came from.
