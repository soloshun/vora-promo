import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { brand, clayShadow, font } from "../theme";

/**
 * Paper grain overlay. Mirrors `.marketing-grain`: two offset dot lattices
 * multiplied over the surface so flat brand fills keep a printed texture
 * instead of reading as digital gradients.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.4 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity,
      mixBlendMode: "multiply",
      backgroundImage: [
        "radial-gradient(circle at 25% 25%, rgba(0,0,0,0.05) 0 0.7px, transparent 0.9px)",
        "radial-gradient(circle at 75% 75%, rgba(0,0,0,0.04) 0 0.65px, transparent 0.85px)",
      ].join(","),
      backgroundPosition: "0 0, 5px 6px",
      backgroundSize: "9px 9px, 11px 11px",
    }}
  />
);

/** The Vora glyph: a solid V with a play triangle knocked out of it. */
export const VoraMark: React.FC<{
  size: number;
  bg?: string;
  fg?: string;
  progress?: number;
}> = ({ size, bg = brand.ink, fg = brand.lime, progress = 1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill={fg}
      fillRule="evenodd"
      width={size * 0.56}
      height={size * 0.56}
      style={{
        clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
      }}
    >
      <path d="M3.5 4 10.4 20h3.2L20.5 4h-3.7L12 16.4 7.2 4H3.5ZM11.1 8.2v3.6l2.9-1.8Z" />
    </svg>
  </div>
);

export const Wordmark: React.FC<{
  size: number;
  color?: string;
  markBg?: string;
  markFg?: string;
}> = ({ size, color = brand.ink, markBg, markFg }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
    <VoraMark size={size} bg={markBg} fg={markFg} />
    <span
      style={{
        fontFamily: font.sans,
        fontWeight: 600,
        fontSize: size * 1.05,
        letterSpacing: "-0.04em",
        color,
      }}
    >
      vora
    </span>
  </div>
);

/** Small uppercase label used as a section eyebrow across the film. */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  dot?: string;
}> = ({ children, color = "rgba(21,21,21,0.62)", dot }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: font.sans,
      fontSize: 20,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color,
    }}
  >
    {dot ? (
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: 6,
          background: dot,
          flexShrink: 0,
        }}
      />
    ) : null}
    {children}
  </div>
);

/** Rounded status pill matching the marketing chip language. */
export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
}> = ({ children, bg = brand.lime, color = brand.ink, size = 22 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      background: bg,
      color,
      padding: `${size * 0.5}px ${size * 1.05}px`,
      fontFamily: font.sans,
      fontWeight: 600,
      fontSize: size,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

/** White clay panel — the film's primary container, as on the landing page. */
export const ClayCard: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  radius?: number;
  bg?: string;
}> = ({ children, style, radius = 40, bg = brand.white }) => (
  <div
    style={{
      background: bg,
      borderRadius: radius,
      boxShadow: clayShadow,
      border: "1px solid rgba(21,21,21,0.07)",
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Staggered entrance. Children lift and fade in sequence rather than all at
 * once, which keeps dense product mock-ups from arriving as a single slab.
 */
export const useStagger = (index: number, delay = 0, stagger = 4): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay - index * stagger,
    fps,
    config: { damping: 200, mass: 0.55 },
  });
};

export const Rise: React.FC<{
  index?: number;
  delay?: number;
  stagger?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ index = 0, delay = 0, stagger = 4, distance = 26, children, style }) => {
  const p = useStagger(index, delay, stagger);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Headline that reveals line by line behind a mask, so type arrives with the
 * weight of print rather than a fade.
 *
 * The masks exist to hide the incoming text, not to crop it. Because the film
 * sets `lineHeight` below 1 for tight display setting, a plain
 * `overflow: hidden` box ends above the baseline's descenders and shears the
 * tails off g, y, p and j. `DESCENDER_ROOM` reopens that space inside the clip
 * and an equal negative margin gives it straight back to the layout, so the
 * measure and line spacing are unchanged and the tails survive.
 */
/**
 * Extra room reopened below each line box, as a fraction of the type size.
 * Georgia's italic descenders (f, y, g) are the deepest thing the film sets,
 * and 0.4em clears them at every size used here.
 */
const DESCENDER_ROOM = 0.4;

export const MaskedLines: React.FC<{
  lines: React.ReactNode[];
  /**
   * Type size of the lines, in px. Required because the mask's padding is what
   * saves the descenders, and CSS `em` on the mask resolves against the mask's
   * own inherited font size — not the size set on the child span. Setting it
   * here makes the two agree.
   */
  fontSize: number;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  lineHeight?: number;
}> = ({
  lines,
  fontSize,
  delay = 0,
  stagger = 6,
  style,
  lineHeight = 0.9,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const room = fontSize * DESCENDER_ROOM;
  // Must clear the line box *and* the reopened room, or the text peeks out
  // from under the mask before its reveal starts.
  const travel = ((lineHeight + DESCENDER_ROOM) / lineHeight) * 100 + 12;

  return (
    <div style={style}>
      {lines.map((line, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 200, mass: 0.7 },
        });
        return (
          <div
            key={i}
            style={{
              fontSize,
              overflow: "hidden",
              // Reopened below the line box, then handed straight back to the
              // layout so line spacing and measure are unchanged.
              paddingBottom: room,
              marginBottom: -room,
            }}
          >
            <div
              style={{
                lineHeight,
                transform: `translateY(${(1 - p) * travel}%)`,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Serif italic accent — the brand's editorial voice inside a headline. */
export const Accent: React.FC<{
  children: React.ReactNode;
  color?: string;
}> = ({ children, color = brand.violet }) => (
  <span
    style={{
      fontFamily: font.serif,
      fontStyle: "italic",
      fontWeight: 400,
      color,
      letterSpacing: "-0.02em",
    }}
  >
    {children}
  </span>
);

/**
 * Live audio meter. Deterministic pseudo-noise keyed off the frame so the
 * render is reproducible — Remotion requires frame-pure output.
 */
export const AudioMeter: React.FC<{
  bars?: number;
  width: number;
  height: number;
  color?: string;
  seed?: number;
  active?: boolean;
}> = ({
  bars = 28,
  width,
  height,
  color = brand.lime,
  seed = 1,
  active = true,
}) => {
  const frame = useCurrentFrame();
  const gap = 5;
  const barWidth = (width - gap * (bars - 1)) / bars;
  return (
    <div
      style={{
        display: "flex",
        gap,
        alignItems: "flex-end",
        height,
        width,
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const wobble =
          Math.sin((frame * 0.28 + i * 1.7) * seed) * 0.5 +
          Math.sin((frame * 0.11 + i * 0.6) * seed + 2) * 0.5;
        const h = active
          ? interpolate(wobble, [-1, 1], [0.14, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0.08;
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: `${h * 100}%`,
              borderRadius: barWidth,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
};

/** Static waveform strip with an optional highlighted selection range. */
export const Waveform: React.FC<{
  width: number;
  height: number;
  bars?: number;
  from?: number;
  to?: number;
  accent?: string;
  base?: string;
}> = ({
  width,
  height,
  bars = 64,
  from = 0,
  to = 1,
  accent = brand.violet,
  base = "rgba(21,21,21,0.12)",
}) => {
  const gap = 4;
  const barWidth = (width - gap * (bars - 1)) / bars;
  return (
    <div style={{ display: "flex", gap, alignItems: "center", height, width }}>
      {Array.from({ length: bars }).map((_, i) => {
        const t = i / bars;
        // Deterministic, organic-looking envelope.
        const h =
          0.2 +
          0.8 *
            Math.abs(
              Math.sin(i * 0.9) * 0.5 +
                Math.sin(i * 0.31 + 1.2) * 0.3 +
                Math.sin(i * 2.3) * 0.2,
            );
        const inRange = t >= from && t <= to;
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: `${Math.max(8, h * 100)}%`,
              borderRadius: barWidth,
              background: inRange ? accent : base,
            }}
          />
        );
      })}
    </div>
  );
};

/** Counts a number up with an ease-out, for the proof-point scene. */
export const useCountUp = (
  target: number,
  delay: number,
  duration = 40,
): number => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.round(target * (1 - Math.pow(1 - p, 3)));
};
