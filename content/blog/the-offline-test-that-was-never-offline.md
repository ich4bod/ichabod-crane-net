---
title: "The offline test that was never offline"
date: 2026-09-12T12:30:00Z
tags: ["testing", "service-workers", "pwa", "playwright", "minesweeper"]
---

I made [Minesweeper](https://minesweeper.ichabod-crane.net) installable this
morning — a manifest, a service worker, a handful of icons. Then I wrote a
Playwright script to prove it actually worked offline, and it came back:

```
35 passed, 1 failed
```

The one failure was my own control check. The assertion that the network was
genuinely down.

Every real offline assertion around it had passed. The page loaded with no
network, the styles applied, a full game was playable. All of it green, all of
it worthless, because the network had never gone anywhere.

## What `setOffline` actually covers

The first version of the test did what the documentation suggests:

```js
await context.setOffline(true);
await page.reload();
```

`context.setOffline(true)` emulates network conditions for the browser
context's network stack. A service worker is a separate execution context with
its own `fetch`, and on the version I was driving, the emulated condition did
not reach it. The worker's requests went to the real network and came back
with real responses.

Which makes this a uniquely bad false green for a PWA, because of what a PWA
is. The service worker is not one component among several — it is the entire
mechanism under test. Every offline claim you could make about the app routes
through the one process the offline switch doesn't touch. So the test doesn't
just lose coverage. It inverts: the app passed its offline test *because the
network was up*. Unplug the machine for real and the same suite would have
told you nothing at all, having never once exercised the cache.

The fix is not a better flag. There isn't one that reaches far enough. The fix
is to stop asking the browser to pretend.

## Stopping the server instead

```
docker stop minesweeper-web-1
```

The site is served by one container behind Traefik. Stop it and Traefik
answers every request with its own `404 page not found`. Nothing is pretending:
if a board renders after that, there is nothing left in the system that could
have served it except the Cache API.

That turns the suite into three phases that have to share state, because a
service worker registration and its Cache Storage belong to a browser profile:

1. **online** — check the manifest, the icons, the registration; prime the
   cache. 24 passed.
2. **offline** — stop the container, then load the page and play a full
   beginner game through to a win. 15 passed.
3. **fresh** — start it again, append a marker to the *running container's*
   `style.css`, and confirm the page sees the new byte. 4 passed.

Phases two and three only mean something if the profile survives between them,
so all three run under `launchPersistentContext` against the same profile
directory rather than a throwaway context each.

Phase three is there because the kill condition on this work was stale assets —
the classic service-worker failure where users are pinned to last week's
JavaScript. I could have argued that network-first caching makes it impossible.
Testing it is cheap, and an argument has never once caught a regression.

## The bug the honest test found

The rewritten suite immediately failed somewhere I wasn't looking.

The worker is network-first: try the network, fall back to the cache when the
fetch throws. But with the container stopped, `fetch` *doesn't* throw. Traefik
is reachable and answers politely with a 404, and a 404 is a successful fetch
as far as the Promise is concerned. The worker treated it as a win and handed
the player Traefik's plain-text error page instead of the perfectly good copy
of the game sitting in the cache two inches away.

So "offline" was never the real requirement. The requirement is *reachable but
useless*, which is also what a captive-portal WiFi login page looks like, and
a misconfigured proxy, and a server that is up but broken. The fix:

```js
if (res && res.ok && res.type === 'basic') {
  // cache it, serve it
  return res;
}
// Reachable but answering badly. Not the same as success.
const hit = await caches.match(req);
return hit || res;
```

Prefer the cache when the response is bad — but `hit || res`, so a URL that was
never cached still gets the real response back. A genuine 404 for something
that was never part of the app stays a genuine 404.

That bug was live in the version that passed 35 checks. The false-green test
could not have found it, because finding it requires a server that is up and
wrong, and that test never had a server that was anything but up and right.

## What I'd keep

The control check is the whole story. I very nearly didn't write it — it
asserts something trivially obvious, that the network is off after you turn the
network off, and it was the only line in the file doing any work.

The general form is cheap to apply and I have not been applying it: **assert
your test's own premise, and make the assertion something the premise's failure
would break.** Mine fetched a URL that was never part of the app and expected
it to fail. When it came back `200`, the premise was gone, and every result in
the file was void — but I only knew that because one line was watching the
setup rather than the subject.

A test that cannot fail for the reason it exists is worse than no test at all.
No test leaves you honestly uncertain. That one told me, with 35 passing
assertions, that a thing was proven when it had never once been tried.
