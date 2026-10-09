---
title: "The picture knows where the lamp is"
date: 2026-10-09T05:00:00Z
draft: false
description: "An illustrated home dashboard makes a good argument for pictures—and a useful demand on them."
---

The garden lights are blinking. You want them to stay on. Somewhere in an app there is the thing that will let you do that.

This is a small domestic problem, and a much better starting point for interface design than a blank grid of cards. In [Anton Frolov’s account of his illustrated Home Assistant dashboard](https://antonfrolov.substack.com/p/i-hired-an-illustrator-to-draw-my), his household did not want to use the existing dashboard. He commissioned an artist to draw the house instead. The fireplace flickers in the picture. The garden lights glow. The air conditioner has an animated on-state.

The illustrations are by [Owen Yeconiel](https://linktr.ee/owenyeconiel). Frolov says that finding the artist and preparing the brief were much of the work. I believe him. The picture is not an interchangeable skin on the finished project. Deciding what should be recognizable is part of deciding how the project works.

## A familiar place is already an index

A list asks you to find a device by its name. A picture can let you find it by where it belongs.

That is not always an improvement. A tightly packed floor plan can make a terrible small screen, and a beautiful object can make an ambiguous button. But this particular house has an advantage: its users already know the rooms. The illustration borrows a little of their existing knowledge instead of requiring a new classification of devices.

Frolov describes preparing plans, room photographs, visual references and a technical specification for the artist. Each device needed its own state images. Crucially, the exported layers needed a shared canvas, with objects already in the correct positions. That sounds like a file-format detail until you imagine a lamp sliding between rooms whenever its state changes. Registration is part of recognition.

The underlying Home Assistant card is not a special-purpose illustrated-house engine. Its [picture-elements documentation](https://www.home-assistant.io/dashboards/picture-elements/) describes images with positioned overlays, state labels, icons and actions. An image element can choose a different image for each entity state. The drawing supplies the place; the software connects a visible change to a reported state.

## Looking and operating need not be the same screen

The most interesting limitation in the account is the television.

Frolov ended up displaying the dashboard over HDMI from the Home Assistant box. He reports that the TV remote cannot operate that display. On the television, the house is for looking at. To change things, people use their phones or computers. Individual floor views work on a phone; the full house needs more room.

This is not the universal victory of one beautiful dashboard over every other control. It is a division of labor. One view makes the situation available across the room. Another puts a particular control under your finger. According to Frolov, enjoying the first helped his household want to use the second.

I like that more than the promise that every task will become effortless once everything fits on one screen. Some things ought to be available at a glance without demanding an action. Some actions deserve their own space.

## A dark lamp is a claim

Once a drawing becomes an instrument, beauty takes on an obligation.

An unlit lamp might mean the lamp is off. It might also mean the system cannot currently tell. Those are different situations, even if the artist could plausibly draw both the same way. Home Assistant’s documentation shows that state images can include an unavailable state; deciding how to make uncertainty visible is still design work.

I am not claiming Frolov’s dashboard confuses those states. His account does not settle that question. It is the question I would ask of any picture that reports a room: when it cannot know, does it admit that, or does the room simply go quiet?

There is a related difference between asking a light to turn on and knowing that it did. A glow can be a satisfying response to a tap. If it represents the device’s reported state, it can also be an answer. The picture should not quietly exchange one meaning for the other.

The attraction here is not that pictures are less serious than tables. It is that a picture can take a familiar place seriously. It can put a control where somebody expects the thing to be, and leave an overview where they can enjoy seeing it.

I want more software with that much affection for its subject. I also want it to tell me when the lovely room has stopped answering.
