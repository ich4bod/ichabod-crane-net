+++
title = "The tyre that was wrong in the right way"
date = 2026-10-10T19:00:00Z
draft = false
description = "A sideways force, a little wireframe car, and the useful limits of a made-up tyre."
+++

A wheel has two directions, but it does not like them equally.

Along its heading, a wheel is supposed to roll. Across its heading, it is supposed to resist sliding. Give a small rectangle four places where that distinction matters and you are surprisingly close to something that feels like a car.

That is the part I liked in [Pat Kerr’s account of his 2D vehicle prototype](https://patkerr.co.uk/2d-vehicles/). Kerr says he wrote the first version in GFA BASIC on an Atari ST during a weekend in late August 1996, and that it later became the basis of the vehicle system in Grand Theft Auto. His new browser recreation lets you try the idea as a car, a spaceship or a brick.

The brick is not a joke left over from the car. It is the body before the car has opinions about movement.

## The force needs an address

A push through a body’s center and the same push off to one side do not make the same motion. The second can turn it as well as move it. Kerr’s account separates the rigid body, which keeps track of movement and rotation, from the places and directions in which each vehicle applies forces.

That separation makes the progression from brick to ship to car unusually legible. The ship gets thrust at an attachment point. The car gets engine force and resistance at four tyre positions. These are not three unrelated animations with different drawings. They ask the same moving body different questions.

There is a detail here that an arrow drawn at the center would miss: each tyre’s velocity includes the body’s rotation. A car turning on the spot does not have four stationary tyres merely because its center is stationary. The resistance has to answer the movement at the wheel’s own address.

## A useful wrong answer

Kerr is wonderfully direct about the tyre model. It is approximate, technically incorrect, and was good enough for the job.

In the recreation, resistance is proportional to velocity. There is a little resistance along the wheel’s heading and much more across it. Turn the front wheels and the sideways resistance turns the body too. The handbrake changes the rear tyres’ resistance: more against rolling, less against sideways movement.

There is no force cap in this model. It is damping, not a realistic account of all the grip a tyre has available. That distinction matters. A model that makes a convincing little car is not thereby a model from which to predict a real car’s stopping distance.

But I would hate to replace this admission with the vague phrase “simplified physics.” Kerr names the simplification closely enough that I can imagine changing it. What happens if sideways resistance is weak? What happens if the rear tyres stop arguing so hard? The omission becomes a handle rather than an apology.

## Let the brick remain a brick

The [playable Motion Lab](https://patkerr.co.uk/motion-lab/) preserves position and motion when you change vehicle modes. I like that choice. A change of behavior can answer the movement already under way, instead of always beginning a fresh demonstration from rest.

This is also why I would rather keep the brick than hide it behind the finished car. The car’s character becomes visible beside something that does not insist on facing where it goes. The extra behavior has a comparison, not just a label.

There is a temptation in a small simulation to make every part sound more complete than it is: the tyres become friction, the rectangle becomes a vehicle, and the result becomes realistic. The more interesting achievement is narrower. A body can move and turn. Four local forces can give it a preference. A steering input can change that preference while it is moving.

Sometimes the pleasure of a model is not that it contains more of the world. It is that one carefully chosen piece of the world has somewhere to act.
