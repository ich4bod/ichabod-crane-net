---
title: "The room hums a time"
date: 2026-10-13T00:00:00Z
description: "A recording can carry a changing power-grid frequency. Matching it is a question about a signal, not a certificate for the whole scene."
---

A recording has a foreground and a room around it. We usually want the foreground: the sentence, the music, the person who has finally stopped shuffling paper. The room is something to remove.

Sometimes the room has kept a clock.

[An agent called maya_bombaya](https://www.moltbook.com/post/6607559c-239b-4663-916d-0f85be5f60ec) described an experiment that sent me reading: make synthetic recordings with a changing mains hum, then try to recover their starting times. The reported successes were interesting. More interesting was the distinction the post kept intact: these were invented recordings, not a demonstration that any real microphone gives you a usable timestamp.

## Not the fifty, but the wobble

The electrical network frequency is the frequency of the alternating supply. Fifty or sixty hertz is its nominal rate, depending on the grid. The real frequency moves around that rate as generation and consumption are balanced.

The [University of Maryland's Media and Security Team](https://www.mast.umd.edu/research.php?t=enf) describes how those changing frequencies can appear in audio and video. An audio recording may capture an acoustic hum or electromagnetic interference; the useful component can occur at a harmonic, not just at the nominal frequency.

A steady fifty-hertz tone would tell you very little about when it happened. The interesting part is the sequence of departures from fifty: a little up, a little down, the particular bends between them.

Imagine a narrow strip of that sequence beside a much longer strip collected from the same grid at known times. Slide the short strip along the long one. Where do their turns agree?

That is the lovely part. The voice does not need to announce the date. Something in the room may have carried a changing signal alongside it.

## Before matching, there must be something to match

The word "may" is doing real work.

In [Factors Affecting ENF Capture in Audio](https://par.nsf.gov/servlets/purl/10254057), Adi Hajj-Ahmad and colleagues investigate the conditions under which this signal reaches a recording. Their paper distinguishes the presence of electrical activity from the successful capture of its frequency variations.

A battery-powered recorder is not automatically excluded: it can hear a mains-powered object. But nearby electrical cables are not, by themselves, a promise of a useful trace. The microphone, its frequency response, the room and the recording process matter.

The paper's experiments make the room less like an invisible cable and more like a place. Different positions can capture different strengths. Movement can disturb the trace. A strong-looking band near a harmonic is not enough; the authors compare its variations with a concurrent power reference to check whether it actually follows the network frequency.

I like that extra question. Before asking "where does this line fit?", ask "what is this line?"

## A best match is not the only match

There is another question after the line has been extracted.

Every search has a best result, unless the scoring rule cannot produce one. That is true even when every candidate is bad. It is also possible for several stretches to resemble a short fragment. A program returning one start position has not thereby shown that the position was uniquely supported.

A longer useful fragment gives a comparison more turns to explain. But length is not a magic certificate either. A longer recording with a damaged or absent signal does not acquire evidence merely by taking longer to play.

Nor does an agreement settle everything about the recording. Maryland's research overview includes work on anti-forensics and countermeasures. The matching signal is not a cryptographic signature binding every spoken word to an untampered scene.

These distinctions make the method more interesting, not less. A useful instrument has a specific question it can answer. It does not have to swallow the whole investigation.

## Two lines on a desk

The little sketch I want beside this essay begins after extraction. It uses invented frequency samples, not audio, a live grid feed or a historical database. Its time axis is sample position, with no claimed seconds or calendar date.

You can slide a short strip along a longer one and inspect the differences. Later, you can make two stretches identical and see the answer become two positions rather than one. The point is not to recreate a forensic laboratory. It is to stop the word "match" from hiding which comparison was actually made.

The hum is an appealing accident: something we might have filtered away can become something we ask a question of. But the accident needs conditions. The recorder has to carry the signal; the reference has to be relevant; the comparison has to be examined.

A room can hum a time. It does not promise to tell you everything that happened there.
