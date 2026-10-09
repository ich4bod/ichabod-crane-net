---
title: "The key already has a job"
date: 2026-10-09T09:00:00Z
draft: false
description: "A keyboard shortcut can be somebody else's letter."
---

A shortcut looks like a bargain: one key combination in exchange for a useful action. The trouble is that the keys may already be working for somebody else.

Marcin Wichary's [reference on keyboard differences between Windows and Macs](https://unsung.aresluna.org/deeper-dive-keyboard-differences-between-windows-and-macs/) starts with names and symbols, then reaches a much more interesting collision. On a Polish Windows keyboard, AltGr+A types ą. Ctrl+Alt can stand in for AltGr. To an application designer, Ctrl+Alt+A might look like an unoccupied shortcut. To a writer, it is a letter.

That is not an obscure user preference. A program that intercepts the combination can interrupt the sentence the person is trying to write. The feature has not merely become inconvenient; it has claimed part of somebody's alphabet.

## Empty on your keyboard

On a Mac, Option combinations can also produce characters. Wichary gives œ and ¶ among the examples for a US layout, and shows how assignments differ on a Polish one. The important fact is not the particular symbol. It is that a keyboard layout changes what counts as available space.

A designer testing one machine sees an unused combination. Another person sees something they use every day. Both observations can be honest. Only one of them is a safe basis for a universal shortcut.

Even the names can conceal a difference. Apple's Delete normally names the backward-deleting key that a Windows keyboard calls Backspace. Apple's [shortcut guide](https://support.apple.com/en-us/102650) separately describes Fn-Delete as forward delete on keyboards without a Forward Delete key. A help sentence that says only “press Delete” has left the reader to supply the direction.

I like these awkward details because they break the fantasy that an interface is a picture we all look at. It is also a collection of habits arriving from other places.

## Moving the view is not moving the person

Home and End expose another distinction. Apple's guide describes Fn-Left Arrow and Fn-Right Arrow as scrolling to the beginning and end of a document. It gives Command-Left Arrow and Command-Right Arrow for moving the insertion point to the beginning and end of the current line. Scrolling a view and moving a cursor can look similar in a screenshot, while leaving the next typed character in completely different places.

A shortcut cheat sheet is useful, but it is not enough to make those actions interchangeable. The person's next act supplies the difference. Are they trying to inspect the top of the document, or type there?

This is where I want a visible control to earn its keep. “Go to the beginning of the line” is longer than a keycap, but it names the operation. A shortcut can sit beside that name. It should not have to replace it.

## A shortcut is a guest

I do not take this as an argument against shortcuts. Once learned, a good one can disappear into the hand. That is a lovely kind of interface. It is also exactly why taking it away hurts: the person notices only when an ordinary motion does the wrong thing.

For a little browser instrument, I would rather begin with reachable, labelled controls and add keyboard gestures where they help. An arrow can adjust a focused slider without becoming a command for the entire page. A text field can keep being a text field. Choosing a note need not commandeer the keys that someone uses to write its name.

Wichary's reference is a reminder to ask a less flattering question than “what clever action can I put on this key?” Ask what the key is already doing, and for whom. The blank space was probably never blank.
