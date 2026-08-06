import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { brand, font, motion } from "../theme";
import { Grain, VoraMark, useCameraPush } from "../components/primitives";

/**
 * Cold open, 0:00–0:05.
 *
 * The lockup simply arrives: mark first, wordmark rising behind it, then the
 * positioning line. Everything is ink and lime, so the film starts at the
 * darkest point it will ever reach and the cut to paper in the next scene
 * lands as a genuine change of light.
 */
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markIn = spring({ frame: frame - 3, fps, config: motion.pop });
  const wordIn = spring({ frame: frame - 10, fps, config: motion.snap });
  const eyebrowIn = spring({ frame: frame - 22, fps, config: motion.snap });
  const push = useCameraPush(90, 0.05);

  const exit = interpolate(frame, [72, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: brand.ink }}>
      <Grain opacity={0.18} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - exit,
          // Pushes in through the shot, then leaves by continuing to grow —
          // the film moves *into* the product rather than cutting away from it.
          transform: `scale(${push + exit * 0.12})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div
            style={{
              opacity: markIn,
              transform: `scale(${0.85 + markIn * 0.15})`,
            }}
          >
            <VoraMark
              size={126}
              bg={brand.lime}
              fg={brand.ink}
              progress={interpolate(frame, [3, 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          </div>
          <div style={{ overflow: "hidden", paddingBottom: 18 }}>
            <span
              style={{
                display: "block",
                fontFamily: font.sans,
                fontWeight: 600,
                fontSize: 132,
                letterSpacing: "-0.05em",
                color: brand.paper,
                lineHeight: 0.95,
                transform: `translateY(${(1 - wordIn) * 110}%)`,
              }}
            >
              vora
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 42,
            opacity: eyebrowIn,
            transform: `translateY(${(1 - eyebrowIn) * 14}px)`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: font.sans,
            fontSize: 24,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.34em",
            color: "rgba(245,242,234,0.55)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: brand.coral,
              opacity: interpolate(
                Math.sin(frame * 0.18),
                [-1, 1],
                [0.35, 1],
              ),
            }}
          />
          The video operating system
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
