import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { brand, font } from "../theme";
import { ArrowRightIcon } from "../components/brand-icons";
import { Accent, MaskedLines, Rise, VoraMark } from "../components/primitives";

/**
 * Close, 1:20–1:28.
 *
 * The landing page's final call, moving: violet field, counter-rotating orbit
 * rings, and the lockup resolving last so the mark is the final held frame.
 */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lockup = spring({
    frame: frame - 130,
    fps,
    config: { damping: 200, mass: 0.8 },
  });

  // Slow settle on the whole field so the last shot never feels static.
  const drift = interpolate(frame, [0, 240], [1.04, 1]);

  return (
    <AbsoluteFill
      style={{
        background: brand.violet,
        overflow: "hidden",
        color: brand.white,
      }}
    >
      {/* Orbit rings, counter-rotating. */}
      <div
        style={{
          position: "absolute",
          top: "-52%",
          right: "-18%",
          width: 1420,
          height: 1420,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.22)",
          transform: `rotate(${frame * 0.14}deg) scale(${drift})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-34%",
          right: "-6%",
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          border: `1px solid ${brand.lime}73`,
          transform: `rotate(${-frame * 0.2}deg) scale(${drift})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-64%",
          left: "-26%",
          width: 1080,
          height: 1080,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.14)",
          transform: `rotate(${frame * 0.1}deg)`,
        }}
      />

      <AbsoluteFill
        style={{
          padding: "96px 104px",
          justifyContent: "center",
        }}
      >
        <Rise delay={4}>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: brand.lime,
            }}
          >
            Your next recording is already full of clips
          </div>
        </Rise>

        <MaskedLines
          fontSize={154}
          delay={14}
          stagger={8}
          lineHeight={0.86}
          style={{ marginTop: 44 }}
          lines={[
            <span
              key="a"
              style={{
                fontFamily: font.sans,
                fontWeight: 500,
                fontSize: 154,
                letterSpacing: "-0.07em",
              }}
            >
              Give every good idea
            </span>,
            <span
              key="b"
              style={{
                fontFamily: font.sans,
                fontWeight: 500,
                fontSize: 154,
                letterSpacing: "-0.07em",
              }}
            >
              <Accent color={brand.lime}>another life.</Accent>
            </span>,
          ]}
        />

        <Rise
          delay={62}
          style={{
            marginTop: 62,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              background: brand.lime,
              color: brand.ink,
              borderRadius: 999,
              padding: "22px 40px",
              fontFamily: font.sans,
              fontWeight: 600,
              fontSize: 30,
            }}
          >
            Start creating <ArrowRightIcon size={26} color={brand.ink} />
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.4)",
              padding: "22px 40px",
              fontFamily: font.sans,
              fontWeight: 500,
              fontSize: 30,
              color: brand.white,
            }}
          >
            Explore the demo workspace
          </span>
        </Rise>

        {/* Final lockup */}
        <div
          style={{
            position: "absolute",
            left: 104,
            right: 104,
            bottom: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: lockup,
            transform: `translateY(${(1 - lockup) * 18}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <VoraMark size={72} bg={brand.lime} fg={brand.ink} />
            <span
              style={{
                fontFamily: font.sans,
                fontWeight: 600,
                fontSize: 74,
                letterSpacing: "-0.045em",
              }}
            >
              vora
            </span>
          </div>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            Record deeply / Release deliberately
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
