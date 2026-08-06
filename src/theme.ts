/**
 * Vora brand tokens, lifted verbatim from the product's marketing layer
 * (`src/app/globals.css` → `.marketing-page`) so the film and the site read as
 * one system. Do not invent colours here; if the brand moves, move both.
 */

export const brand = {
  ink: "#151515",
  paper: "#f5f2ea",
  paperWarm: "#fbf8f2",
  violet: "#6355dc",
  violetSoft: "#eee9ff",
  violetMid: "#ece8ff",
  lime: "#c7ff4a",
  limeSoft: "#eff8d7",
  coral: "#ff6846",
  coralSoft: "#ffb79d",
  sky: "#dff2ff",
  skyMid: "#71b7ff",
  white: "#ffffff",
} as const;

/**
 * Type stack, matched to what the product actually paints.
 *
 * The app loads Manrope through `next/font/google` and declares
 * `--font-serif: Georgia, "Times New Roman", serif` — so every italic accent on
 * the landing page renders in Georgia, not a display serif. The film mirrors
 * that stack exactly, with Gelasio (a metric-compatible Georgia substitute,
 * loaded as a webfont) behind it so the render is identical on a machine
 * without Georgia installed.
 */
export const font = {
  sans: "Manrope",
  serif: 'Georgia, Gelasio, "Times New Roman", serif',
  mono: '"SF Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as const;

/** Shared clay elevation used across marketing surfaces. */
export const clayShadow = "0 24px 70px rgba(72, 51, 138, 0.16)";
export const clayShadowDeep = "0 34px 90px rgba(72, 51, 138, 0.22)";

export const FPS = 30;

/**
 * Scene map. `start`/`duration` are frames at 30fps and are the single source
 * of truth for the timeline, the music arrangement, and the generated
 * voiceover script — so narration, score and picture cannot drift apart.
 *
 * Cut to a 120 BPM grid: one bar is 60 frames, one beat 15. Every scene starts
 * on a bar or half-bar line so the edit lands with the music rather than
 * against it.
 */
export const scenes = {
  coldOpen: { start: 0, duration: 90 }, // 0:00
  problem: { start: 90, duration: 210 }, // 0:03
  record: { start: 300, duration: 240 }, // 0:10
  understand: { start: 540, duration: 300 }, // 0:18
  clipModes: { start: 840, duration: 240 }, // 0:28
  edit: { start: 1080, duration: 240 }, // 0:36
  publish: { start: 1320, duration: 270 }, // 0:44
  proof: { start: 1590, duration: 150 }, // 0:53
  cta: { start: 1740, duration: 180 }, // 0:58
} as const;

export const TOTAL_FRAMES = 1920; // 64s

/**
 * Motion presets.
 *
 * The film is paced to feel active, so elements arrive fast and settle fast.
 * `snap` is the default: it reaches its target in roughly eight frames with a
 * touch of overshoot, which reads as energy without wobbling. Reserve `glide`
 * for large surfaces where a bounce would look cheap.
 */
export const motion = {
  snap: { damping: 24, mass: 0.34, stiffness: 220 },
  pop: { damping: 16, mass: 0.3, stiffness: 260 },
  glide: { damping: 40, mass: 0.6, stiffness: 170 },
} as const;

/** Frames a scene may overrun its slot to dissolve into the next one. */
export const OVERLAP = 8;
