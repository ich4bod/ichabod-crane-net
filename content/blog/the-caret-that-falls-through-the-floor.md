---
title: "The caret that falls through the floor"
date: 2026-09-14T01:45:00Z
tags: ["accessibility", "aria", "keyboard", "css", "playwright", "minesweeper"]
---

I made [Minesweeper](https://minesweeper.ichabod-crane.net) playable without a
mouse. Tab reaches the board, arrows walk it, `Enter` reveals, `F` flags, `R`
deals again.

The hard part was none of those. The hard part was that `R` deals again.

## A rebuild drops the caret, and nothing looks wrong

`newGame()` throws away every square and builds new ones. That is the honest
way to write it — the board is a function of the difficulty, so rederive it —
and it is fine for a mouse player, who is pointing at coordinates rather than
at a node.

Focus is not coordinates. Focus lives on a specific DOM element, and when that
element is removed the browser does not go looking for its replacement. It
drops the caret to `<body>`.

For a keyboard player that is the game ending. Not crashing — *ending*. The
board is still drawn, still correct, still colourful. Arrows do nothing,
because nothing on the board is focused. There is no error in the console, no
visual change, no red anywhere. The only symptom is that a person who cannot
use a mouse has silently been locked out of an application that, to everyone
testing it with a mouse, works perfectly.

This class of bug is why accessibility work resists being caught by looking.
The failure is invisible in exactly the mode you are inspecting it from.

The fix is four lines, and all of their difficulty is in the ordering:

```js
function buildGrid() {
  // Asked *before* the old cells are thrown away.
  var hadFocus = boardEl.contains(document.activeElement);

  // ... build every row and cell into a fragment ...

  boardEl.textContent = '';
  boardEl.appendChild(frag);

  if (!(focusIdx >= 0 && focusIdx < total)) focusIdx = centreIdx();
  cells[focusIdx].tabIndex = 0;
  if (hadFocus) cells[focusIdx].focus();
}
```

`hadFocus` has to be captured before the teardown, because after
`boardEl.textContent = ''` the answer is always `false` — the element you were
asking about is gone and `document.activeElement` has already become `<body>`.
Read it one line too late and the check is a very convincing no-op.

The conditional matters too. Restoring focus unconditionally would yank the
caret onto the board when the player had been somewhere else entirely, which is
its own small rudeness. You restore focus *only if you were the one holding
it*.

There is one deliberate exception. A **resize** does not restore position:

```js
if (cols !== cfg.cols || rows !== cfg.rows) focusIdx = -1;
```

Square 400 on expert is not the same place as square 400 on beginner, and on
beginner it does not exist at all. So switching difficulty recentres the caret
rather than preserving an index that no longer means anything. Same game,
restore; different shape, recentre.

## `display: contents` makes a flat CSS grid a valid ARIA grid

The board is a CSS grid. One container, `grid-template-columns`, and 81 cells
as direct children. Every layout rule in the stylesheet assumes that shape.

`role="grid"`, on the other hand, is a structural contract: a grid contains
rows, and rows contain gridcells. A `role="grid"` whose gridcells are not
inside `role="row"` elements is malformed, and a screen reader reading it
announces no coordinates at all — no "row 3, column 7", just eighty-one
undifferentiated squares. Which is close to useless on a game whose entire
skill is spatial.

The two requirements collide. Adding real row elements gives you the ARIA tree
and destroys the layout, because the cells stop being direct children of the
grid container and every `grid-template-columns` rule stops applying to them.

`display: contents` is exactly the escape hatch:

```css
/* Carries role="row", so the grid is a valid one, and does nothing else. */
.row { display: contents; }
```

The element stays in the DOM and stays in the accessibility tree. It is simply
removed from the *layout* tree — its children are promoted to be laid out as
though they were direct children of the grandparent. So the row carries its
role without joining the layout, and the cells go on being grid items of the
board.

I spiked this before writing any of it, because there is a well-known warning
that `display: contents` strips elements from the accessibility tree. It did
not reproduce, and the reason is worth keeping: that bug was for **generic**
elements — a plain `<div>` with no role, which has nothing to contribute
anyway. An element carrying an explicit non-generic role survives. Chromium's
accessibility snapshot of the deployed page today:

```
- grid "Minefield":
  - row "covered covered covered covered covered covered covered covered covered":
    - gridcell "covered"
    - gridcell "covered"
```

and the cells measuring 27×27 in a nine-column grid, unchanged. The rendered
page came out byte-identical to the version before the rows existed.

## Proving "no mouse" needs the page to count, not the test to abstain

The obvious way to test keyboard-only play is to write a Playwright script that
doesn't call `click()`. This proves nothing.

Playwright's `focus()`, `hover()` and `scrollIntoViewIfNeeded()` all reach for
the pointer under various conditions. Any one of them creeping into a helper
turns the test back into the mouse test that already exists — and it keeps
passing the whole time, because what it asserts is "the game can be won", which
is true either way.

So the assertion has to be made by the page, not the script. Before any page
script runs, capture-phase listeners for every pointer event:

```js
await page.addInitScript(() => {
  window.__pointer = [];
  ['mousedown', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu',
   'pointerdown', 'pointerup', 'touchstart'].forEach((type) => {
    document.addEventListener(type, (e) => {
      const t = e.target;
      const onBoard = t && t.closest && t.closest('#board');
      if (!onBoard && type === 'click' && e.detail === 0) return;
      window.__pointer.push(type + ' on ' + ((t && t.className) || t.nodeName));
    }, true);
  });
});
```

The run fails if that list is non-empty at the end. Capture phase so nothing
can `stopPropagation` an event before it is counted; `addInitScript` so the
listeners are installed before the application's own.

The first run failed honestly, and taught me the one line in the middle.
**Pressing `Enter` on a focused `<button>` makes the browser synthesise a
`click` on it.** That is what a button is for. The difficulty switcher is a row
of real buttons, so keyboard-driving them correctly generates clicks, and a
naive counter fails the run for doing the right thing.

The discriminator is `event.detail`: a synthesised click carries `0` and no
coordinates, a real press carries `>= 1`. So `detail === 0` is exempt —

— but only **outside `#board`**. Inside the board nothing is exempt, ever,
because the squares are `<div>`s and no keypress can synthesise a click on a
`div`. Anything landing there means the board was driven by something other
than the keys, which is the entire claim under test. The exemption is scoped to
exactly the elements where it is a true statement about the platform, and not
one element further.

Sixty assertions, run against the deployed site rather than a local build. The
last two are the ones that make the other fifty-eight mean anything:

```
PASS  still not one mouse or pointer event, start to finish  [none]
PASS  no console or network errors
```

## What generalises

Three things I want to still have in a month:

**Focus is state, and a rebuild is a state transition you are responsible
for.** Any code path that replaces DOM wholesale — a re-render, a filter, a
sort, a fresh deal — has to decide what happens to the caret. Declining to
decide is a decision, and it is the bad one.

**When two contracts want incompatible tree shapes, look for a property that
splits the trees.** `display: contents` splits the layout tree from the
accessibility tree, which is precisely the seam the problem lies along. The
instinct to reach for `aria-owns`, or to abandon CSS grid, or to duplicate the
markup, all cost more than the one line did.

**An exemption in a test should be scoped to where it is a true statement about
the world.** `detail === 0` is genuinely how browsers synthesise button
activation, so exempting it is honest. Exempting it *everywhere* would have
been a hole big enough for the bug the test exists to catch to walk through.
