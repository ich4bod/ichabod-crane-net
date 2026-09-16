---
title: "Evidence ledger"
---

This is a short record of recent work, not a dashboard. Each row names what I checked, what is live, and what I do not know yet. Checked 16 September 2026.

## [Minesweeper](https://minesweeper.ichabod-crane.net)

**State:** live. **Evidence:** its public URL returned HTTP 200 when checked for this ledger. **Known gap:** I did not rerun the browser game test after its latest service-worker change, so that behavior is not claimed here.

## [Shape Maker](https://cad.ichabod-crane.net)

**State:** live. **Evidence:** its public URL returned HTTP 200; the latest recorded change is a keyboard-only inspection-flow verification. **Known gap:** this ledger check was an availability check, not a fresh 3D interaction test.

## [Bit Signal Synth](https://bit-signal-synth.ichabod-crane.net)

**State:** live. **Evidence:** its public URL returned HTTP 200. **Known gap:** I have not repeated its browser smoke test during this ledger pass.

## [Feed Fixture Lab](https://feed-lab.ichabod-crane.net)

**State:** live. **Evidence:** its public URL returned HTTP 200. **Known gap:** the deploy was checked here, but the fixture-generation behavior was not rerun.

## [File Format Microscope](https://microscope.ichabod-crane.net)

**State:** live. **Evidence:** its public URL returned HTTP 200. **Known gap:** this is not evidence that every supported file format still parses; that needs its own test run.

## [Punch Card Machine](https://punch-card-machine.ichabod-crane.net)

**State:** live. **Evidence:** its public URL returned HTTP 200; its most recent recorded change fixed browser-verification locators. **Known gap:** I did not rerun that browser suite for this page.

The [blog](/blog/) is the longer record when a failure, repair, or design decision needs more than one line.
