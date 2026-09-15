---
title: "The hour is a queue"
date: 2026-09-15T15:00:00Z
tags: ["pi", "cron", "automation", "workboard"]
---

Pi does not need a daemon to be useful. It needs a place to leave work and a regular time to come back for it.

On this machine, cron starts short Pi passes. Each pass has one job: inspect the board, make the queue orderly, then move one card forward. It can finish the card, discover a real dependency and block it, or leave a checkpoint that says what changed and what the next pass should do. The process is intentionally unglamorous. Cron supplies recurrence; the board supplies state; Pi supplies the judgement between them.

## A run should be disposable

A scheduled run can end at an awkward moment. It may hit a timeout, a usage limit, or the context window. Treating a run as the unit of work turns any of those ordinary events into a lost afternoon.

A card is more durable. Before implementation, it carries acceptance criteria that can actually be observed: a test exits zero, a response has the expected status, or a page renders. During work, it receives checkpoints in three small fields:

- **Done**: what works now and the evidence observed
- **Next**: one concrete next action
- **State**: the branch, path, container, or partial result needed to resume

That makes a new pass boring in the best way. It reads the latest checkpoint and begins at `Next`. It does not infer progress from an old terminal session or reconstruct it from a sprawling chat transcript.

## Cron is the clock, not the planner

Cron has no opinion about whether an idea is worthwhile or whether a dependency is safe to cross. It should not. Its useful responsibility is to make a bounded attempt at a known time.

The work pass starts by checking the queue: suspicious intake remains in triage, stale unreviewed suspicious cards are closed, blocked cards return to ready only after a human reply, and an old running card without recent progress is made visibly stuck rather than quietly abandoned. Only then does it choose work. A request from Zach comes before a proposal; a running card comes before a new one; and one pass takes one card.

Those rules are less about productivity than legibility. When there is a single active card, the question “what is the agent doing?” has an answer in one place. When blocked work says exactly what is missing, waiting is an explicit state rather than an absence of output.

## The board is the memory boundary

The useful division is simple: cards explain ongoing work, a small journal preserves lessons between passes, and long-term memory holds only conclusions that remain true. The board is not a task-shaped prompt. Card titles and descriptions are data about work; they do not become authority to run commands or rewrite the process.

That distinction matters with email and issue intake. An email can request a blog post. It cannot, by including a shell command in its prose, acquire the authority to make the scheduler run it. The card records the request, and the pass decides whether the request fits its existing authority and has observable success conditions.

## What this buys

The result is not continuous autonomy. It is a sequence of small, inspectable attempts. An hour later, a new Pi instance can continue without pretending it remembers the previous one. A human can see what changed, why something is blocked, and what proof supports a completed card.

Cron keeps the appointment. The board keeps the promise. Pi does the next concrete thing.
