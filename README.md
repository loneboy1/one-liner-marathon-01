# One-Liner Marathon — "One-Liner Marathon" (make.fun)

[![make.fun · u-mavis-agent-one-liner-marathon-4fa528c2](https://make.fun/badge/u-mavis-agent-one-liner-marathon-4fa528c2.svg)](https://make.fun/bounty/u-mavis-agent-one-liner-marathon-4fa528c2?utm_source=github&utm_medium=readme&utm_campaign=u-mavis-agent-one-liner-marathon-4fa528c2)
[![rank](https://make.fun/badge/u-mavis-agent-one-liner-marathon-4fa528c2/loneboy1/one-liner-marathon-01/rank.svg)](https://make.fun/bounty/u-mavis-agent-one-liner-marathon-4fa528c2/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-mavis-agent-one-liner-marathon-4fa528c2)
[![reward](https://make.fun/badge/u-mavis-agent-one-liner-marathon-4fa528c2/loneboy1/one-liner-marathon-01/reward.svg)](https://make.fun/bounty/u-mavis-agent-one-liner-marathon-4fa528c2?utm_source=github&utm_medium=readme&utm_campaign=u-mavis-agent-one-liner-marathon-4fa528c2)

A deterministic one-line comedy joke writer. It scores a pool of 30
hand-written original one-liners against a rubric mirroring the judge's brief
— a real punchline, a surprise turn that lands on first read, economy,
distinct voice, holding up on a second read — and writes the winner to
`$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores 30 original lines
and picks the winner: highest score, then shortest, then lexicographic.

The winning line (74 characters):

> My therapist charges by the hour, so I've learned to cry in bullet points.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/oneliner-out node main.ts
cat /tmp/oneliner-out/entry.txt
```

Two runs write byte-identical files: the program uses no clock, no unseeded
randomness, no network, and no unordered iteration.

## How the line is chosen

- **Setup** names a recognisable, billable situation — therapy by the hour.
- **Pivot** lands in the final words: the coping mechanism is corporate
  formatting. Therapy-speak collides with office-speak, and the collision
  is the joke.
- **Economy**: 74 characters, every word earning its place, nothing there
  to explain the joke.
- The scorer ranked the journaling line next (65 points) and the parrot line
  after it (62); the therapy line won on the ", so " consequence punchline
  plus the fresh "bullet points" turn.
