import React from "react";
import { Composition } from "remotion";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadGelasio } from "@remotion/google-fonts/Gelasio";

import { FPS, TOTAL_FRAMES } from "./theme";
import { VoraPromo } from "./Video";

/*
 * Loaded at module scope so every frame of every render has the faces ready;
 * Remotion blocks the render until the returned promises settle. Weights and
 * subsets are pinned to exactly what the film uses — the default pulls 42
 * files and slows every render start.
 *
 * Gelasio is the portable stand-in for Georgia, which the product's
 * `--font-serif` names first. On this machine Georgia wins and Gelasio is never
 * painted; on a machine without it the metrics still hold. See `font` in
 * theme.ts.
 */
loadManrope("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
loadGelasio("italic", {
  weights: ["400"],
  subsets: ["latin"],
});

export const RemotionRoot: React.FC = () => (
  <Composition
    id="VoraPromo"
    component={VoraPromo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
