# Vora product film

A 64-second enterprise product film for [Vora](../Vora), built in
[Remotion](https://remotion.dev) — React components rendered deterministically
to 1920×1080 H.264.

Everything on screen is derived from the real product: the palette and
typography come from `Vora/src/app/globals.css`, the clay illustrations from
`Vora/public/media`, and the claims from `product-spec.md`. No invented metrics,
no stock footage, no logo wall.

```bash
npm install
npm run music             # → public/music.wav (synthesised score)
npm run voiceover         # → public/vo/*.mp3  (needs ELEVENLABS_API_KEY)
npm start                 # Remotion Studio — scrub, edit, hot-reload
npm run build             # → out/vora-promo.mp4
npm run still             # → out/poster.png (thumbnail frame)
npm run typecheck
```

## The film

| # | Scene | In | Dur | What it shows |
|---|-------|------|-----|---------------|
| 1 | Cold open | 0:00 | 3s | Mark snaps in, wordmark behind it. Ink and lime. |
| 2 | Premise | 0:03 | 7s | A 94-minute source scrubs past; the stories inside it pop up one by one. |
| 3 | 01 Capture | 0:10 | 8s | Studio stage: composited screen + camera, live meters, chunk recovery ticking up. |
| 4 | 02 Understanding | 0:18 | 10s | The pipeline filling in order — diarised transcript, keyframe sampling, scored candidates. |
| 5 | 03 Modes | 0:28 | 8s | Selection walks the four clipping modes; every dependent surface re-keys. |
| 6 | 04 Shaping | 0:36 | 8s | 16:9 → 1:1 → 9:16 reframe with word-by-word burned-in captions. |
| 7 | 05 Release | 0:44 | 9s | Targets validate, preflight counts to 12/12, then the plan flips to Approved. |
| 8 | Proof | 0:53 | 5s | Four true numbers and the security posture. |
| 9 | Close | 0:58 | 6s | Violet field, orbit rings, final lockup. |

The film is cut fast on purpose. Scenes are short, motion is snappy
(`motion.snap` in `src/theme.ts` settles in about eight frames), and the
cross-dissolve is only 8 frames so the edit reads as a cut rather than a fade.

**Motion carries the argument.** Where a claim can be shown as movement rather
than stated as a caption, it is:

| Scene | The claim | The motion that makes it |
|-------|-----------|--------------------------|
| Premise | The stories are buried in the recording | Markers surface out of the source bar as the playhead crosses them; the raw recording then dims behind them |
| 01 Capture | Every second is saved as you record | Chunks physically detach from the stage and arc down into the recovery bar, which fills as they land |
| 02 Understanding | Vora reads the whole thing | A read-head sweeps down the transcript while lines resolve under it; candidates then lift *out of* that evidence |
| 03 Modes | These are alternatives to one question | The result copy wipes in from the right on each switch, and the selected card's accent rail wipes open from its centre |
| 04 Shaping | One master, many feeds | The frame itself narrows 16:9 → 1:1 → 9:16 with the subject held in the safe area |
| 05 Release | One decision, many destinations | A light sweeps across the four targets on approval, and the plan chip kicks as it flips |
| Proof | — | Each number kicks as its count settles |

Every scene also carries a slow push-in (`useCameraPush`) and exits with a
directional slide (`useSceneExit`), so nothing is ever fully static and each cut
travels forward.

Everything is cut to a **120 BPM grid** — one bar is 60 frames, one beat 15 —
and every scene starts on a bar or half-bar line, so the picture lands with the
score instead of against it. The map in `src/theme.ts` (`scenes`) is the single
source of truth: the timeline, the music arrangement and the voiceover script
are all written against those same numbers.

## Layout

```
src/
  theme.ts              Brand tokens + the scene timing map. Start here.
  Root.tsx              Composition registration and font loading.
  Video.tsx             Timeline assembly and cross-dissolve ordering.
  voiceover.json        Narration script AND render manifest (see VOICEOVER.md).
  audio.json            Optional music bed.
  components/
    Chapter.tsx         Shared frame for the five product acts.
    primitives.tsx      Grain, mark, masked type, meters, waveforms, counters.
    brand-icons.tsx     Destination glyphs.
    Narration.tsx       Mounts each VO line at its own timestamp.
  scenes/               One file per scene.
public/
  media/                Clay illustrations, copied from the product.
  vo/                   ElevenLabs output (generated).
```

## Audio

The full timed script, the ElevenLabs workflow, and the score are documented in
**[VOICEOVER.md](./VOICEOVER.md)**.

Narration lines are generated individually and mounted at their own timestamps
rather than stitched into one track, so no system `ffmpeg` is needed and the
voiceover cannot drift from the picture. `npm run voiceover -- --check` reports
each line's spoken length against the gap before the next one.

The music bed is synthesised by `npm run music` and scored to the scene map, so
it has no third-party rights attached and its arrangement lands on the cuts.
Swap in a licensed track by pointing `"music"` at it in `src/audio.json`.

Both are optional at render time — with neither generated, the composition
renders silently rather than failing on a missing file.

## Type

The film uses the product's stack, not an approximation of it:

- **Manrope** for everything sans, loaded as a webfont — the same face
  `Vora/src/app/layout.tsx` pulls through `next/font/google`.
- **Georgia** for the italic accents, because the app declares
  `--font-serif: Georgia, "Times New Roman", serif` and that is what the
  landing page actually paints. **Gelasio** (metric-compatible with Georgia) is
  loaded behind it so a machine without Georgia renders the same layout.

`MaskedLines` takes an explicit `fontSize` for a non-obvious reason: the reveal
masks need padding below each line box to clear descenders, and CSS `em` on the
mask resolves against the mask's own inherited size, not the size set on the
child span. Passing it in is what keeps the tails on g, y and p.

## Editing notes

- **Retiming a scene:** change `duration` in `src/theme.ts`, then update that
  scene's internal `outAt` (or its fade `interpolate` range) to match, shift the
  affected `startSeconds` in `voiceover.json`, and update the matching
  `automation` window in `scripts/generate-music.mjs`.
  `npm run voiceover -- --check` will tell you if narration no longer fits.
- **Changing pace:** the three levers are scene `duration`, the `motion` spring
  presets, and the per-scene delay/stagger constants. Speeding up the springs
  alone makes things arrive faster but does not shorten the film.
- **Animation must be a pure function of `frame`.** No `Date.now()`, no
  `Math.random()` — Remotion renders frames out of order and in parallel.
- **Colours come from `brand` in `src/theme.ts`**, which mirrors the product's
  marketing tokens. If the brand moves, move it there and both stay in sync.
- Remotion's bundler needs **TypeScript 5.x**; 7.x changes the compiler API it
  reads `tsconfig` through and the build fails at 6% with
  `Cannot read properties of undefined (reading 'readFile')`.

## Other deliverables

```bash
npm run still             # poster frame for thumbnails / OG images
```

For a vertical cut, add a second `<Composition>` in `src/Root.tsx` at 1080×1920.
The chapter layout is a flex row and will need `flexDirection: column` for that
aspect; the scenes themselves are resolution-independent.
