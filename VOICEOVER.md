# Vora product film — narration script

Total runtime **1:04** (1920 frames @ 30fps, 1920×1080).

The film is cut fast, and the script is written to match: 22 short, clipped
lines across 64 seconds — a beat roughly every 2.5 seconds, with almost no dead
air. Lines are deliberately fragmentary ("Screen. Camera. Mic. One studio.")
because at this pace full sentences drag. Narration never crosses a scene
transition.

`src/voiceover.json` is the machine-readable version of this table and is the
**single source of truth** — each line is mounted in the composition as its own
`<Audio>` at its `startSeconds`, so editing the JSON moves both the script and
the render. This document is generated from it by hand; if you change one,
change both.

## Timed script

| # | In | Scene | Line |
|---|------|-------|------|
| — | 0:00.0 | Cold open | *(silent — logo resolve)* |
| 01 | 0:03.2 | Premise | You recorded the whole idea. |
| 02 | 0:05.4 | Premise | Inside it: a dozen stories nobody will ever see. |
| 03 | 0:08.6 | Premise | Vora finds them. |
| 04 | 0:10.4 | 01 Capture | Screen. Camera. Mic. One studio. |
| 05 | 0:13.0 | 01 Capture | Every second saved as you record. |
| 06 | 0:15.8 | 01 Capture | Crash-safe by default. |
| 07 | 0:18.4 | 02 Understanding | Then Vora listens. |
| 08 | 0:20.0 | 02 Understanding | Transcript. Speakers. Visuals. Story shape. |
| 09 | 0:23.2 | 02 Understanding | Read together, in one pass. |
| 10 | 0:25.4 | 02 Understanding | Every cut comes with its evidence. |
| 11 | 0:28.4 | 03 Modes | Choose how it listens. |
| 12 | 0:30.2 | 03 Modes | Moments. Story arcs. Topics. Tutorials. |
| 13 | 0:33.0 | 03 Modes | Different evidence, not different labels. |
| 14 | 0:36.4 | 04 Shaping | Shape it once. |
| 15 | 0:38.0 | 04 Shaping | Captions. Framing. Safe zones. Every feed. |
| 16 | 0:41.2 | 04 Shaping | Your master never changes. |
| 17 | 0:44.4 | 05 Release | You approve every destination. |
| 18 | 0:46.6 | 05 Release | Publish now, or schedule it. |
| 19 | 0:49.0 | 05 Release | Nothing ships without you. |
| 20 | 0:53.6 | Proof | Private storage. Encrypted tokens. Originals untouched. |
| 21 | 0:58.6 | Close | Vora. |
| 22 | 1:00.0 | Close | Give every good idea another life. |

## Direction for the voice

Confident and quick, with forward momentum — but not shouty. The clipped
sentence fragments should land as punches, not as a list being read. Voice
settings lean expressive on purpose (`stability` 0.32, `style` 0.45) and
`speed` is nudged to 1.06; the generator falls back to normal rate if a model
rejects that field.

## Generating with ElevenLabs

```bash
# The key is read from .env automatically; exporting it also works.

npm run voiceover -- --voices     # list voices on your account
npm run voiceover -- --quota      # character balance vs. cost of a full rerun
npm run voiceover -- --voice <id> # generate with a specific voice
npm run voiceover                 # generate with the default in voiceover.json
npm run voiceover -- --force      # re-generate every line regardless of cache
npm run voiceover -- --check      # re-check timing only, no API calls
```

### Voice Library voices need a paid plan

Only voices **on the account** work through the API. A voice picked from the
public Voice Library fails with:

```
402 paid_plan_required
Free users cannot use library voices via the API.
```

That is a plan-tier restriction, not a quota one — the character balance is
untouched. `npm run voiceover -- --quota` distinguishes the two, and
`--voices` lists what the account can actually use.

Each line is written to `public/vo/<id>.mp3`. The generator fingerprints each
line's text and voice settings, so **editing the script regenerates only the
lines that changed** — everything else is reused and costs no credits. The key
is read from `.env` if it is not already exported.

The script then reports, per line, how long the delivery actually is against
the gap before the next line, and flags anything that overruns:

```
  ✓ 08  20.0s → 23.0s   3.00s spoken, 3.2s budget
  ! 07  29.4s → 35.4s   overruns line 08 by 0.61s
```

Fix an overrun by shortening the text or pushing the **next** line's
`startSeconds` later in `src/voiceover.json`. Scene boundaries are in
`src/theme.ts` — keep each line inside its own scene.

Current voice is `XrExE9yKIg1WjnnlVkGX` — **Matilda**, model
`eleven_multilingual_v2`. Chosen from the account's nine female voices as the
only one labelled `upbeat` while also `professional` and
`informative_educational`: the exact intersection of the lively delivery this
cut needs and the credibility an enterprise product film needs. Alto pitch
keeps it from getting shrill at 1.06× speed.

Closest alternates, both one field change away:
`hpp4J3VqNfWAUOO0d1Us` (Bella — brighter, more narrative) and
`aD6riP1btT197c6dACmy` (Rachel M — British radio-advert read, worth trying
given the brand prices in GBP).
Change either at the top of `voiceover.json`; doing so re-fingerprints every
line, so the whole script regenerates on the next run.

## Music

The score is generated, not licensed:

```bash
npm run music     # → public/music.wav
```

`scripts/generate-music.mjs` synthesises a driving 64.6-second track at 120 BPM
in A minor, resolving to C major under the closing card: four-on-the-floor kick,
sixteenth hats, eighth-note bass, off-beat stabs and a sixteenth arp.

It is written rather than sourced for two reasons. Provenance: this is a
commercial promo, so a synthesised track carries no third-party rights to get
wrong. Fit: the arrangement is keyed to the scene map in `src/theme.ts`, so the
groove drops in with the studio at 0:10, a riser and impact land on the cut into
the clipping modes at 0:28, the track lifts through the release scene, breaks
for the proof card at 0:53, and returns full on the closing lockup at 0:58. A
stock loop cannot do that.

The mix is deliberately hollow through the 300 Hz–3 kHz vocal band — weight
below, movement above — so the narration cuts through without sidechain
ducking. Level is set by `musicVolume` in `src/audio.json` (currently `0.19`).

To use a licensed track instead, drop it in `public/` and point `"music"` at
it. Nothing else changes.
