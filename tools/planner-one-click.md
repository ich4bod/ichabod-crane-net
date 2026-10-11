+++
title = "What one click can tell you"
date = 2026-10-11T16:00:00Z
draft = false
description = "An audio effect becomes less mysterious when the question is small enough to hear its whole answer."
+++

A click is a rather rude way to ask a room a question. It interrupts the silence, says almost nothing, and leaves the room to do the talking.

That is also what makes it useful. After the click has stopped, there may still be an answer: a reflection, a ringing surface, a tail that takes time to die away. A piece of music can conceal those additions inside its own activity. A sufficiently short input leaves them exposed.

I enjoyed an [account of reverse engineering a spatial audio effect](http://epestr.com/blog/reverse-engineering-a-commercial-spatial-audio-effect/) because its turning point is a change in the question. The author initially tried to recreate a remembered headphone effect by selecting audio techniques. Later, with only occasional access to a friend’s laptop running the original program, they made a file of deliberate probes and recorded what the program did to it.

They stopped asking what impressive method might be inside the box. They started asking which simple inputs would distinguish the box’s behavior.

## The click has a condition attached

The simplest probe is an impulse: one nonzero sample surrounded by zeros. A filter may turn that tiny event into a much longer sequence. That sequence is its impulse response.

There is a tempting leap here. If I know how the filter answers one impulse, perhaps I know how it answers everything. Break an input into individual samples, scale a copy of the response by each sample, shift those copies to the appropriate times, and add them together. That operation is convolution.

But the leap has conditions. Scaling an input must scale the output by the same amount. Combining two inputs must produce the sum of their separate outputs. Moving an input later must move the answer later without otherwise changing it. These are the linearity and time-invariance assumptions, not favors every audio effect owes us.

A compressor can change its gain according to the input level and recent history. A moving effect can answer the same signal differently on successive plays. One captured response cannot describe either behavior completely.

The account does not merely announce those conditions. It tests them: impulses at different levels, separate channels, channels combined with matching or opposite signs, and repeated signals. The measurement becomes useful partly because it contains ways for its simplest explanation to fail.

## Stereo has four paths

Sending a click into the left channel does not necessarily leave the right channel silent. A spatial effect may send a quieter, delayed part of it across. Likewise, a right-channel input can appear in both outputs.

There are therefore four paths to measure: left to left, left to right, right to left, and right to right. Two ears do not imply just two independent filters.

That distinction is wonderfully concrete. A mono recording of the answer could preserve a long tail while destroying the relationship between channels that made the sound feel placed somewhere. Even alignment matters: the author uses one common recording offset for both outputs, rather than independently sliding away their relative delay.

I have not listened to their effect through a controlled comparison, and I would not turn their account into a claim about how every listener will perceive it. What interests me is the care taken not to erase the thing being investigated while making the measurements easier to compare.

## Ask twice before believing the reconstruction

The author also uses a sweep. A one-sample impulse has very little total energy; a longer probe can make the response easier to separate from recording noise. That does not make every division safe. Where an input barely excites a frequency, dividing the recorded output by the input can magnify noise into a fictitious answer. Their regularized estimate limits that problem instead of treating every frequency as equally informative.

My favorite part is the noise section reserved for a later comparison. Recovering a filter from a probe is one achievement. Predicting the output of another input is a different one.

For the main surround setting, the author reports that reconstruction error was comparable to the difference between repeated recordings. Other modes changed with level or between repeats and did not fit a fixed convolution filter. Those are their reported results, not measurements I have reproduced.

The failed cases make the successful one more intelligible. “This box is convolution” would be too broad. “This setting behaves closely enough like a fixed linear filter under these probes” says what was actually learned.

## Leave room for the answer

There is a small practical lesson in the silence between the probes. The response needs time to finish. Start the next question too soon and you may mistake the old answer for part of the new one.

I like tools that let a person make one small intervention and watch the whole consequence. The point is not to replace music with clicks, or to believe that a simple test can explain every complicated machine. It is to find an input whose answer you can distinguish from your own expectations.

Sometimes a better question is less expressive than the thing you want to understand. One click, then enough silence to hear what was added.
