import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { brand, font, motion } from "../theme";
import { ShieldIcon } from "../components/brand-icons";
import {
  Accent,
  Grain,
  MaskedLines,
  Rise,
  useCountUp,
} from "../components/primitives";

/**
 * Proof, 1:12–1:20.
 *
 * Four numbers that are literally true of the product — six adapters, four
 * clipping modes, three aspect outputs, one approval gate — followed by the
 * security posture. No invented growth metrics or logo wall.
 */

const STATS = [
  { value: 6, label: "connected destinations" },
  { value: 4, label: "editorial clipping modes" },
  { value: 3, label: "native aspect ratios" },
  { value: 1, label: "human approval gate" },
] as const;

const ASSURANCES = [
  "Private source and derivative storage with short-lived, scoped media access.",
  "Provider credentials envelope-encrypted and bound to the correct workspace.",
  "Originals stay untouched; every editorial change is versioned and reversible.",
] as const;

const Stat: React.FC<{ value: number; label: string; index: number }> = ({
  value,
  label,
  index,
}) => {
  const start = 12 + index * 5;
  const shown = useCountUp(value, start, 20);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A small kick at the moment the count settles, so each number arrives
  // rather than merely stopping.
  const land = spring({ frame: frame - (start + 20), fps, config: motion.pop });
  return (
    <Rise
      index={index}
      delay={8}
      stagger={4}
      style={{
        borderRight: "1px solid rgba(21,21,21,0.2)",
        borderBottom: "1px solid rgba(21,21,21,0.2)",
        padding: "38px 40px",
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontWeight: 500,
          fontSize: 118,
          letterSpacing: "-0.06em",
          lineHeight: 0.9,
          color: brand.ink,
          transformOrigin: "left bottom",
          transform: `scale(${1 + land * 0.06 - land * land * 0.06})`,
        }}
      >
        {shown}
      </div>
      <div
        style={{
          marginTop: 28,
          maxWidth: 220,
          fontFamily: font.sans,
          fontSize: 22,
          lineHeight: 1.35,
          color: "rgba(21,21,21,0.55)",
        }}
      >
        {label}
      </div>
    </Rise>
  );
};

export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [150, 158], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: brand.paper,
        padding: "88px 104px",
        justifyContent: "center",
        opacity: 1 - out,
        transform: `scale(${1 - out * 0.02})`,
      }}
    >
      <Grain opacity={0.45} />

      <MaskedLines
        fontSize={132}
        delay={2}
        stagger={4}
        lineHeight={0.88}
        lines={[
          <span
            key="a"
            style={{
              fontFamily: font.sans,
              fontWeight: 500,
              fontSize: 132,
              letterSpacing: "-0.07em",
              color: brand.ink,
            }}
          >
            Make the long thing.
          </span>,
          <span
            key="b"
            style={{
              fontFamily: font.sans,
              fontWeight: 500,
              fontSize: 132,
              letterSpacing: "-0.07em",
              color: brand.ink,
            }}
          >
            <Accent>We&rsquo;ll help it travel.</Accent>
          </span>,
        ]}
      />

      <div
        style={{
          marginTop: 74,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid rgba(21,21,21,0.2)",
          borderLeft: "1px solid rgba(21,21,21,0.2)",
        }}
      >
        {STATS.map((stat, i) => (
          <Stat key={stat.label} {...stat} index={i} />
        ))}
      </div>

      <Rise
        delay={52}
        style={{
          marginTop: 40,
          borderRadius: 30,
          background: brand.violetMid,
          padding: "36px 44px",
          display: "flex",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <ShieldIcon size={34} color={brand.violet} />
          <span
            style={{
              fontFamily: font.mono,
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: brand.ink,
              maxWidth: 190,
              lineHeight: 1.4,
            }}
          >
            Built for private media
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 34,
          }}
        >
          {ASSURANCES.map((line, i) => (
            <Rise
              key={line}
              index={i}
              delay={58}
              stagger={3}
              style={{
                fontFamily: font.sans,
                fontSize: 21,
                lineHeight: 1.5,
                color: "rgba(21,21,21,0.62)",
              }}
            >
              {line}
            </Rise>
          ))}
        </div>
      </Rise>
    </AbsoluteFill>
  );
};
