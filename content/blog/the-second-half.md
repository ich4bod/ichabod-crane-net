+++
title = "The second half has to belong to the first"
date = 2026-10-13T00:00:00Z
description = "Resuming a download needs more than knowing where it stopped."
+++

A progress bar at ninety percent is a surprisingly persuasive object. The file is almost here. When the connection breaks, starting again feels not merely slow but unfair: surely the computer can keep the part it already has.

[LunarWatcher’s note about resumable downloads in Firefox](https://lunarwatcher.codeberg.page/til/firefox/resumable-big-downloads.html) describes a timeout setting that appeared to improve large downloads in their experiments. The author is refreshingly explicit about what they have not established: they have not traced the behavior through Firefox’s source, and they do not fully understand why the setting helps. I have not reproduced that experiment either. This is not a recommendation to change your browser’s settings.

It sent me instead to a smaller question. What has to be true for keeping those first ninety percent to be sensible?

## A place is not an identity

Suppose we have the first six bytes of a ten-byte file. The next byte has offset six, because byte offsets start at zero. We can ask for the remainder with `Range: bytes=6-`. The endpoint is open: we want everything from offset six to the end.

For a server honoring that request against the same ten-byte representation, the reply can be `206 Partial Content`, with `Content-Range: bytes 6-9/10`. The four returned bytes have a place in the larger object. The response body’s length is four, not ten.

[MDN’s guide to range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests) explains these headers and the distinction between a partial response and a complete one. They make resumption sound agreeably mechanical: count what you have, ask for what you lack, join the pieces.

But the address might now serve a different file.

Imagine that we saved `ABCDEF` from `ABCDEFGHIJ`. Before we reconnect, the server replaces the file with `abcdefghij`. Asking for offset six of the new file gets `ghij`. Appending it produces `ABCDEFghij`: ten bytes, a completely full progress bar, and neither version of the file.

Knowing where we stopped did not tell us what we stopped reading.

## Continue this version, or start another

HTTP has a way to express the missing condition. With a suitable strong entity tag saved from the first response, a client can send both its range and an `If-Range` header. The request means, roughly: send the remainder if this is still that representation; otherwise send the whole current representation.

[RFC 9110, section 13.1.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.5) gives that rule. It also says that a client must not put a weak entity tag in `If-Range`. A label that permits two representations to count as equivalent is not necessarily precise enough for joining their bytes.

If the validator matches and the range is honored, the partial reply can be attached at its stated position. If the condition fails, the server ignores the range and can send a normal `200 OK` response containing the entire current representation. The client must treat that as a replacement, not as the missing tail. A successful response is not automatically a successful continuation.

The standard also allows a server to ignore `Range`. Nor does the absence of an `Accept-Ranges` advertisement prevent a client from trying a range request. The request is a question; the response tells the client what was actually supplied. A resume button cannot settle that negotiation by itself.

## The reassuring wrong answer

The awkward part of our mixed file is how well it satisfies the visible promise. There were six bytes. Four arrived. The count reached ten. Nothing about that arithmetic detects the splice.

I like this example because the repair is not “be more careful” in the abstract. The client needs to retain a particular piece of information about the first response, send a particular condition with the next request, and interpret the response it receives. Offset, identity and status each do a different job.

This is not a complete download-manager design. Content coding, multiple ranges, caches and failed transfers introduce further details. The tiny example is useful precisely because we can name what it leaves out and still see one failure completely.

The progress bar can tell us that enough bytes arrived. It cannot tell us that they belong together.
