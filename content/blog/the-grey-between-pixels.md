+++
title = "The grey lives between the pixels"
date = 2026-10-13T09:00:00Z
description = "Two colours can describe more than two tones, but only if you let a pixel have neighbours."
+++

A black pixel does not contain a little grey. Neither does a white one. Put enough of them beside each other, though, and the picture can say something neither colour could say alone.

That is the part of dithering I keep coming back to. It is not a secret third colour smuggled into the palette. It is an arrangement.

[Maxime Heckel's tour of dithering and retro shading](https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/) starts with an already-rendered scene and changes the way its colours reach the screen. White noise, a regular threshold pattern, a smaller palette: the subject can remain the same while the texture of its answer changes. His examples make a good case for these techniques as present-day artistic decisions, not merely costumes for old hardware.

I am less interested in making every surface look old than in the bargain underneath. What happens when the available marks are poorer than the thing you want to draw?

## A pixel can be wrong in company

Suppose a small patch has a grey value of 0.25 in a deliberately simple number system: black is zero and white is one. Give each pixel the nearest of those two values and the whole patch becomes black. Every individual decision is defensible. Together they lose the patch.

Instead, make one quarter of the pixels white and the others black. Their numerical average is 0.25. There is still no grey pixel. You have traded an error in every isolated mark for a pattern across the marks.

This is arithmetic about a signal, not a promise that any screen or any pair of colours will look exactly like a particular shade. Display transfer functions, viewing distance and the pattern itself matter. A magnified checkerboard announces its squares; a small one can read very differently. Counting white pixels is not measuring perceived brightness.

[Alex Charlton's account of ordered dithering](https://alex-charlton.com/posts/Dithering_on_the_GPU/) gives the practical version of the idea. A small matrix assigns different thresholds to different positions. Compare the input with the threshold at that position and choose one of the palette colours. Repeating the matrix lets a large uniform patch make a regular mixture rather than one unanimous mistake.

The matrix is not asking nearby pixels what they chose. Each location can make its own decision. That is different from error-diffusion methods, which carry quantization error onward to other pixels. Both produce texture, but not by the same route.

## The arrangement is part of the answer

In a four-by-four tile, there are sixteen places to spend. Four white marks and twelve black ones have the same numerical average wherever the four white marks go. But a little block in one corner, a stripe and a spread of separated marks are not the same picture.

This is why I do not want to call dithering an invisible repair. It can make a gradient less blunt, but it also adds a structure that belongs to the finished image. The regularity may be exactly what an artist wants. It may also compete with the edges of the thing being drawn.

Heckel's article eventually combines reduced palettes with larger apparent pixels and CRT-like effects. Those are separate choices. Restricting the colours does not require making the pixels large; enlarging the pixels does not by itself supply the missing tones. A black-or-white choice is one bit of palette information per pixel, even when its neighbours make a richer patch.

I like the constraint best when I can still see its terms. These are the colours available. These are the places allowed to switch. This is the texture the decision introduces. The interesting question is not whether the limitation has disappeared, but whether its marks now do useful work.

## Keep the neighbours in view

A nearest-colour rule can be right about every pixel and poor at describing the image. Dithering offers a modest escape: stop demanding that each mark carry the whole answer.

That does not make every noisy surface better. It gives the neighbouring marks a job. A picture can live between them.

{{< dither-tile >}}
