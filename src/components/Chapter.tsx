import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

import { brand, font } from "../theme";
import { CheckIcon } from "./brand-icons";
import { Grain, MaskedLines, Rise } from "./primitives";

/**
 * Shared chapter frame for the four product acts.
 *
 * Deliberately the same composition the landing page uses for its workflow
 * cards — eyebrow, oversized headline, three proof lines, and a large visual —
 * so the film and the site teach the same shape. Only the palette and the
 * visual change between acts; the alternating dark/light backgrounds give the
 * middle of the film its rhythm.
 */
export const Chapter: React.FC<{
  index: string;
  eyebrow: string;
  headline: React.ReactNode;
  /** Type size of `headline`, in px — see MaskedLines on why it's needed. */
  headlineSize: number;
  points: string[];
  background: string;
  dark?: boolean;
  flip?: boolean;
  /** Fractional width of the copy column. */
  copyRatio?: number;
  children: React.ReactNode;
  /** Frame at which the whole chapter begins easing out. */
  outAt: number;
}> = ({
  index,
  eyebrow,
  headline,
  headlineSize,
  points,
  background,
  dark = false,
  flip = false,
  copyRatio = 0.38,
  children,
  outAt,
}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [outAt, outAt + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ink = dark ? brand.paper : brand.ink;
  const muted = dark ? "rgba(245,242,234,0.56)" : "rgba(21,21,21,0.58)";
  const rule = dark ? "rgba(245,242,234,0.16)" : "rgba(21,21,21,0.16)";

  const copy = (
    <div
      style={{
        width: `${copyRatio * 100}%`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingRight: flip ? 0 : 72,
        paddingLeft: flip ? 72 : 0,
      }}
    >
      <Rise delay={4}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: font.mono,
            fontSize: 21,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: muted,
          }}
        >
          <span style={{ color: dark ? brand.lime : brand.violet }}>
            {index}
          </span>
          <span style={{ width: 46, height: 1, background: rule }} />
          {eyebrow}
        </div>
      </Rise>

      <MaskedLines
        fontSize={headlineSize}
        delay={10}
        stagger={6}
        lineHeight={0.94}
        style={{ marginTop: 34 }}
        lines={[headline]}
      />

      <div style={{ marginTop: 52, borderTop: `1px solid ${rule}` }}>
        {points.map((point, i) => (
          <Rise key={point} index={i} delay={30} stagger={7}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "19px 0",
                borderBottom: `1px solid ${rule}`,
                fontFamily: font.sans,
                fontSize: 27,
                fontWeight: 500,
                color: dark ? "rgba(245,242,234,0.86)" : "rgba(21,21,21,0.82)",
                letterSpacing: "-0.01em",
              }}
            >
              <CheckIcon
                size={22}
                color={dark ? brand.lime : brand.violet}
              />
              {point}
            </div>
          </Rise>
        ))}
      </div>
    </div>
  );

  const visual = (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background,
        color: ink,
        opacity: 1 - out,
        transform: `scale(${1 - out * 0.025})`,
      }}
    >
      {!dark ? <Grain opacity={0.42} /> : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          padding: "86px 104px",
          gap: 0,
        }}
      >
        {flip ? (
          <>
            {visual}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {visual}
          </>
        )}
      </div>
    </div>
  );
};
