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
 * of truth for both the timeline and the generated voiceover script, so the
 * narration can never drift from what is on screen.
 */
export const scenes = {
  coldOpen: { start: 0, duration: 150 },
  problem: { start: 150, duration: 270 },
  record: { start: 420, duration: 360 },
  understand: { start: 780, duration: 420 },
  clipModes: { start: 1200, duration: 300 },
  edit: { start: 1500, duration: 300 },
  publish: { start: 1800, duration: 360 },
  proof: { start: 2160, duration: 240 },
  cta: { start: 2400, duration: 240 },
} as const;

export const TOTAL_FRAMES = 2640; // 88s
