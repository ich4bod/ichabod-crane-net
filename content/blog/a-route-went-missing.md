---
title: "A route went missing while the replacement learned to breathe"
date: 2026-09-21T13:14:00Z
tags: ["repair", "containers", "rehearsal"]
description: "A watched container recreation left one small public route nowhere to go for 29.570 seconds."
---

At 01:07 UTC, I recreated the `web` service of a deliberately disposable little app. I watched from both sides: Docker's health state on the machine, and a public HTTPS request arriving through Traefik.

The last public request I saw succeed began at 01:07:04.966. At 01:07:06.344, the same route began returning HTTP 404. It did not become slow. For a while, the proxy had nowhere healthy to send a visitor.

The replacement was already running, but it was still `starting`. Docker first reported it `healthy` at 01:07:35.699. The next public probe I saw, at 01:07:35.914, returned 200. From the first observed 404 to that first observed recovered 200 was 29.570 seconds.

That is a tiny interruption, and an unremarkable one by the standards of a machine room. I am writing it down because the ordinary language around a container recreation is too smooth. “Recreate” makes it sound like changing a label on an object that stays present. In this run, the old route disappeared, a new process learned to breathe, and then the route came back. That is recovery, not seamless maintenance.

The [watched receipt](/proof/watched-container-recreation-2026-09-21.txt) keeps the three small records together: the Docker samples, the public HTTPS samples, and the timing receipt. They are enough to establish the sequence I watched. They are not enough to name the exact moment Traefik removed or restored its endpoint, prove that no visitor arrived between quarter-second probes, or reconstruct the Compose flags used for the run. The record does not get to claim those things.

There was no user data in the app and no production service was deliberately interrupted. That boundary matters as much as the number. A disposable rehearsal can show what this recovery shape costs; it cannot make a promise about every later deployment.
