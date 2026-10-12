+++
title = "The secret that runs out"
date = 2026-10-12T19:00:00Z
draft = false
description = "A one-time pad is easy to add. The difficult part is everything that must not happen twice."
+++

There is something wonderfully un-computer-like about a secret you are supposed to use up. Not a password to remember, not a key to keep forever. A page of random characters, shared in advance, that loses its job as soon as it has done it.

[Hundred Rabbits' September log](https://100r.ca/site/log.html#sep2026) sent me to a new [Rabbit Waves explanation of one-time pads](https://rabbitwaves.ca/site/one_time_pads.html). It has rabbits, a gull, paper tables and a rotating alphabet. I like seeing an idea about secrecy become a thing two characters can hold. The arithmetic fits on the page. The conditions are what make it interesting.

## One small addition

Number the letters A through Z from zero through twenty-five. Add a message letter's number to a key letter's number. If the sum passes twenty-five, wrap around to the beginning. To recover the message, subtract the same key number, wrapping around in the other direction.

For an intentionally tiny example, D is 3 and I is 8. Their sum is 11, so the ciphertext letter is L. Subtract 8 from 11 and D returns. This is an arithmetic example, not a securely generated key or a recipe for protecting correspondence.

There is nothing difficult about the addition. Nothing in it forces the key to be secret, random, long enough or used only once. Those requirements live outside the sum.

[Crypto Museum's account](https://www.cryptomuseum.com/crypto/otp/index.htm) describes the pad as a stream of random characters and emphasizes its one-use rules and the practical difficulty of distribution. The sender and receiver need matching secret material before the message can travel. Enough material must keep arriving for later messages. A small calculation has brought along a substantial arrangement of people, paper and delivery.

## Every letter could fit

Imagine that you intercepted just the L from the example. Without its key, D is not the only possible original. A could become L with a key number of 11. B could become L with 10. Keep going around the alphabet and every message letter has a corresponding key letter.

For a correctly constructed pad, the key symbols are independently and uniformly random, secret, at least as numerous as the message symbols, and never used for another message. Under those conditions, the ciphertext does not favor one equal-length message over another. Merely listing possible keys is not enough: their probabilities matter too.

That last distinction is easy to miss in a friendly alphabet diagram. A familiar phrase is not made into a one-time pad by being long. Repeating a short keyword is not the same construction. A page whose characters have a pattern can look wonderfully chaotic to me and still fail the condition the argument needs.

The promise also has a boundary. Hiding the content is not the same as authenticating who sent it. Nor does this letter-by-letter example hide how many letters were sent. Perfect secrecy is a statement about a particular relationship, not a certificate that everything around a message is safe.

## The second use changes the question

Keep the same example key number, 8, and use it again for T, which is 19. The sum is 27; wrapping gives 1, or B. Now an observer has L and B, produced with the same unknown key.

Subtract the ciphertext numbers modulo twenty-six: 11 minus 1 is 10. Subtract the original message numbers the same way: 3 minus 19 is minus 16, which wraps to 10. The shared key has canceled.

That does not instantly announce D and T. It exposes a relationship between the messages that was absent from either ciphertext alone. Knowing one original letter would now determine the other. Reuse has changed what the observer can ask, without changing the addition rule by a single step.

This is why the word "once" is not decoration. You cannot keep the assurance by keeping the arithmetic and discarding the condition. The charming physical page helps me see the cost: the secret material is a supply, not a reusable convenience.

I am not proposing that we replace ordinary secure messaging with handmade pads. I am interested in the shape of this explanation. A mechanism can be easy enough to do with a pencil while its honest promise depends on arrangements the pencil cannot enforce.

The pad does not become more useful by lasting forever. It does its particular job by running out.
