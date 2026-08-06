# Vora product film — narration script

Total runtime **1:28** (2640 frames @ 30fps, 1920×1080).

The film is deliberately visual-led: ~150 spoken words across 88 seconds, with
long silent stretches where the product surfaces carry the story on their own.
Narration never overlaps a scene transition.

`src/voiceover.json` is the machine-readable version of this table and is the
**single source of truth** — each line is mounted in the composition as its own
`<Audio>` at its `startSeconds`, so editing the JSON moves both the script and
the render. This document is generated from it by hand; if you change one,
change both.

## Timed script

| # | In | Scene | Line |
|---|------|-------|------|
| — | 0:00 | Cold open | *(silent — logo resolve)* |
| 01 | 0:05.4 | Premise | You recorded the whole idea. |
| 02 | 0:08.0 | Premise | Inside it are a dozen stories nobody will ever see. |
| 03 | 0:11.6 | Premise | Finding them by hand is why most of them stay buried. |
| 04 | 0:15.2 | 01 Capture | Vora starts where you do. |
| 05 | 0:18.0 | 01 Capture | Screen, camera and microphone in one studio — and every second saved locally as you record. |
| 06 | 0:27.0 | 02 Understanding | Then Vora listens. |
| 07 | 0:29.4 | 02 Understanding | Transcript, speakers, visual context and narrative shape, read together. |
| 08 | 0:34.8 | 02 Understanding | Every suggestion arrives with its evidence, its reasoning, and a complete ending. |
| 09 | 0:41.6 | 03 Modes | Choose how it listens. |
| 10 | 0:44.0 | 03 Modes | Standout moments. Full story arcs. Topic stacks. Tutorial cuts. |
| 11 | 0:51.6 | 04 Shaping | Then shape the story once. |
| 12 | 0:54.2 | 04 Shaping | Captions, framing and safe zones for every feed — without ever touching your master. |
| 13 | 1:01.6 | 05 Release | Approve every destination yourself. |
| 14 | 1:04.2 | 05 Release | Publish now, or place the release on the calendar. Nothing ships without you. |
| 15 | 1:13.0 | Proof | Private storage. Encrypted credentials. Originals untouched. |
| 16 | 1:21.0 | Close | Vora. Give every good idea another life. |

## Direction for the voice

Calm, low-energy, unhurried — a product person explaining their work, not an
ad read. Let the visuals land; do not push energy into the gaps. Lines 01–03
are the setup and should sit slightly back; line 16 is the only line that
should feel like a statement.

## Generating with ElevenLabs

```bash
export ELEVENLABS_API_KEY=sk_...

npm run voiceover -- --voices     # list voices on your account
npm run voiceover -- --voice <id> # generate with a specific voice
npm run voiceover                 # generate with the default in voiceover.json
npm run voiceover -- --force      # re-generate lines already on disk
npm run voiceover -- --check      # re-check timing only, no API calls
```

Each line is written to `public/vo/<id>.mp3`. Existing files are reused, so
re-running is cheap and only new or `--force`d lines cost credits.

The script then reports, per line, how long the delivery actually is against
the gap before the next line, and flags anything that overruns:

```
  ✓ 05  18.0s → 24.9s   6.90s spoken, 9.0s budget
  ! 07  29.4s → 35.4s   overruns line 08 by 0.61s
```

Fix an overrun by shortening the text or pushing the **next** line's
`startSeconds` later in `src/voiceover.json`. Scene boundaries are in
`src/theme.ts` — keep each line inside its own scene.

Default voice is `JBFqnCBsd6RMkjVDRZzb` (George — measured British narration),
model `eleven_multilingual_v2`. Change either at the top of `voiceover.json`.

## Music

The score is generated, not licensed:

```bash
npm run music     # → public/music.wav
```

`scripts/generate-music.mjs` synthesises an 88.5-second ambient bed at 84 BPM
in A minor, resolving to C major under the closing card. It is written rather
than sourced for two reasons: this is a commercial promo, so a synthesised
track carries no third-party rights to get wrong; and the arrangement is keyed
to the scene map in `src/theme.ts` — the pad opens on the cold open, the sub
pulse enters with the studio at 0:14, the lift lands on the release scene at
1:00, and everything resolves on the closing card. A stock loop cannot do that.

The mix is deliberately hollow through the 300 Hz–3 kHz vocal band — pads sit
low, sparkle sits high — so the narration cuts through without sidechain
ducking. Level is set by `musicVolume` in `src/audio.json` (currently `0.15`).

To use a licensed track instead, drop it in `public/` and point `"music"` at
it. Nothing else changes.
