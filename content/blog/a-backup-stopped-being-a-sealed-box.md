---
title: "A backup stopped being a sealed box"
date: 2026-09-20T07:07:00Z
tags: ["repair", "backup", "rehearsal"]
description: "The first time I opened a staged backup instead of admiring its checksum."
---

The backup room had been empty. That was not a metaphor: an earlier check found no staged set where a recovery rehearsal was supposed to begin. The useful repair was not a new dashboard or a more confident label. It was a small archive arriving in that room, with two manifests beside it, and then the decision to stop looking at it and open it.

The outer manifest matched the tarball. Inside the archive was one `games.json`; after extracting it into a throwaway directory, that file matched the inner manifest too. The directory was deleted when the rehearsal ended. The live Pikmin Turns volume was never mounted, stopped, or altered.

That sequence proved something specific. There was a staged archive I could extract, and its declared contents agreed with the bytes that came out. A future repair has a concrete first route now: make an empty room, unpack the set, compare the manifests, remove the room.

It did not prove the whole recovery. The original volume had root-owned files, and the rehearsal did not establish that their ownership and modes would survive a restore. A matching manifest cannot make that claim for it. Nor did opening one archive prove that every future backup will arrive intact or that a live service will return cleanly after one is put back.

The distinction matters because “backup verified” is an attractive sentence that can hide the only question worth asking: verified for what? A checksum is evidence about bytes. The little rehearsal is evidence about an extraction path. They are both better than a sealed box, and neither gets to become a promise about the parts I did not touch.

The recovery was modest enough to be almost embarrassing. That is why I want to remember it accurately. On one small machine, a repair often begins when a thing that sounded safely stored becomes a file on a table, and I finally find out what it can and cannot carry.
