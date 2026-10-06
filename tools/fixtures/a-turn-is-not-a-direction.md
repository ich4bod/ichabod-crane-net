+++
title = "A turn is not a direction"
date = 2026-10-06T00:00:00Z
draft = false
description = "A little flock taught me why arrows need a shared scale."
+++

A bird can be pointed to the right and still be turning left. That sounds like a riddle until you draw two arrows: where it is already going, and what its neighbors are asking it to change.

I ran into this while looking closely at [Evening Flock](https://evening-flock.ichabod-crane.net/), my little sky of eighty birds. The flock is pleasant to watch as a whole. Pick one bird, though, and the interesting question becomes smaller: why will this one move that way on the next beat?

The toy has three familiar requests. Keep away from birds that are too close. Adjust toward nearby velocities. Steer toward the average nearby position. Each request produces a correction to the current velocity, not a replacement destination. Their weights matter. A whisper about gathering and a hard shove away from a crowded patch should not look equally persuasive just because both can be drawn as arrows.

A direction arrow can legitimately hide that distinction. Make every arrow the same length and it becomes a useful compass: this rule points that way. But put three such arrows together and the picture starts suggesting something it does not know. Two long-looking arrows might nearly cancel, or one might be much weaker than the other. You cannot add arrows whose lengths have each been independently tidied up.

So the new folded inspector gives the three weighted corrections one shared scale. It also draws their sum. Sometimes the gathering arrow points toward the same birds the close-range rule is pushing away from. The flock is not confused. Those are two different requests, and the next beat combines them.

There is one more arrow to keep separate: the existing flight. A correction to the left need not make a bird fly left immediately. It may only reduce a stronger rightward velocity. In this toy, the result is then limited to three world units per beat. The cap changes the length of that result, not its direction. The inspector compares the current flight, the uncapped result and the next flight without giving each a private ruler.

Try a crowded sky, pause it, turn on Neighbors and choose a bird. Open Before the next beat. Compare Keep apart with Flock, then take one beat and step back. A correction is easier to understand when you can watch exactly the decision it was describing. The numbers use toy units; they are not measurements of real birds.

The distinction matters beyond this particular drawing. An arrow can show a direction, a velocity, a correction or a destination. All four can point toward the same place while answering different questions. The caption should tell you which question you are looking at, and the scale should not quietly switch questions for you.

[Craig Reynolds's Boids page](https://www.red3d.com/cwr/boids/) describes local steering based on nearby flockmates. His neighborhood also includes an angle relative to the direction of flight. My toy uses a simple distance ring across a wrapped sky instead. I like being able to poke at the mechanism, but that simplification belongs in the explanation. A convincing flock is not a claim that a real bird sees the world this way.
