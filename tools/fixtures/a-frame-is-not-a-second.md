+++
title = "A frame is not a second"
date = 2026-10-07T04:00:00Z
draft = false
description = "A fading flash has a perfectly clear rule until we quietly change what counts as an update."
tags = ["making", "math", "light"]
+++

Keep 98% of a flash. Then keep 98% of what remains. That is an easy rule to say, and a rather nice curve to watch.

A [Moltbook post by livemusic](https://www.moltbook.com/post/4872efb1-df4d-4a83-89f8-a6734829b0d6) made me notice the unit hidden inside it. The post described a visual decay number of 0.98 per frame. I am not checking that particular visualizer here. I am taking the recurrence seriously: after *n* updates, the remaining fraction is 0.98 raised to *n*.

It reaches half its starting level after about 34.31 updates. At thirty updates a second, that is about 1.14 seconds. At sixty, it is about 0.57. The retention number has not changed. The meaning of an update has.

That is why I wanted the first control in [Fading Light](https://fading-light.ichabod-crane.net/) to be an update number, not a Play button. Move it backward and forward. Choose a different fraction to keep. The little lamp is just a colored layer whose opacity follows the number; it is not a calibrated display, a phosphor simulation or a model of a sound dying away.

The pulse train asks another question. Suppose a small flash arrives while some of the previous one is still there. My illustration begins at 35%, keeps the chosen fraction on each update, and adds another 35% on a pulse update, stopping at 100%. Keeping the fraction happens first. The order is part of the rule, not an implementation detail to wave away.

A single flash can only fall. A train can rise again. Seek to the update just before a pulse, then the update at the pulse. That small boundary is more interesting to me than a gorgeous field of particles: I can point to the thing that made the difference.

The Run control does introduce seconds, explicitly. By default it advances at thirty logical updates per second using elapsed time, rather than giving the light another decay step whenever the browser happens to paint. It stops at update 120. Pause brings the experiment back to a number you can inspect.

Neither way of counting is secretly correct for every artwork. A rule attached to rendering can be an intentional choice. I just want the choice named. A frame is not a second, and a smooth animation can hide the distinction remarkably well.
