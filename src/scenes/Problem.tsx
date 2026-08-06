import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { brand, font } from "../theme";
import { Accent, Grain, MaskedLines } from "../components/primitives";

/**
 * The premise, 0:05–0:14.
 *
 * A 94-minute source bar runs the full width of the frame, then the stories
 * buried inside it light up one by one — visually stating the problem before
 * any product surface appears.
 */

/** Story positions along the source bar, as fractions of total duration. */
const MOMENTS = [
  { at: 0.08, label: "hook", color: brand.lime },
  { at: 0.21, label: "insight", color: brand.violet },
  { at: 0.34, label: "story", color: brand.coral },
  { at: 0.46, label: "demo", color: brand.skyMid },
  { at: 0.58, label: "lesson", color: brand.violet },
  { at: 0.67, label: "hook", color: brand.lime },
  { at: 0.79, label: "story", color: brand.coral },
  { at: 0.91, label: "insight", color: brand.violet },
] as const;

const BAR_WIDTH = 1620;

const HEADLINE: React.CSSProperties = {
  fontFamily: font.sans,
  fontWeight: 500,
  fontSize: 112,
  letterSpacing: "-0.065em",
  color: brand.ink,
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barIn = spring({
    frame: frame - 6,
    fps,
    config: { damping: 200, mass: 1.4 },
  });

  // Playhead scrubs the full source, triggering each moment as it passes.
  const playhead = interpolate(frame, [30, 190], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const elapsedSeconds = Math.round(playhead * 94 * 60);
  const timecode = `${String(Math.floor(elapsedSeconds / 3600)).padStart(
    2,
    "0",
  )}:${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(
    2,
    "0",
  )}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  const out = interpolate(frame, [270, 288], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: brand.paper,
        opacity: 1 - out,
        transform: `scale(${1 - out * 0.02})`,
      }}
    >
      <Grain opacity={0.5} />

      <AbsoluteFill style={{ padding: "96px 150px", justifyContent: "center" }}>
        {/*
          Three explicit lines, not one wrapping paragraph: MaskedLines reveals
          per element, so a browser-decided line break would slide in with the
          wrong line and break the stagger.
        */}
        <MaskedLines
          fontSize={112}
          delay={8}
          stagger={7}
          lines={[
            <span key="a" style={HEADLINE}>
              You recorded the whole idea.
            </span>,
            <span key="b" style={HEADLINE}>
              Inside it, a dozen stories
            </span>,
            <span key="c" style={HEADLINE}>
              <Accent>nobody will ever see.</Accent>
            </span>,
          ]}
          style={{ marginBottom: 96 }}
        />

        {/* ── The source bar ─────────────────────────────────────────── */}
        <div style={{ position: "relative", height: 190 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 20,
              opacity: barIn,
              fontFamily: font.mono,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "rgba(21,21,21,0.5)",
            }}
          >
            <span>Founder story / source</span>
            <span style={{ color: brand.ink, fontSize: 26 }}>{timecode}</span>
            <span>01:34:00</span>
          </div>

          <div
            style={{
              position: "relative",
              height: 88,
              width: BAR_WIDTH * barIn,
              borderRadius: 14,
              background: "rgba(21,21,21,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Watched portion */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${playhead * 100}%`,
                background: "rgba(99,85,220,0.14)",
              }}
            />
            {/* Density texture so the bar reads as media, not a progress bar. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "0 6px",
              }}
            >
              {Array.from({ length: 190 }).map((_, i) => {
                const h =
                  0.18 +
                  0.82 *
                    Math.abs(
                      Math.sin(i * 0.8) * 0.5 +
                        Math.sin(i * 0.27 + 1.1) * 0.32 +
                        Math.sin(i * 2.1) * 0.18,
                    );
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h * 62}%`,
                      borderRadius: 2,
                      background:
                        i / 190 < playhead
                          ? "rgba(99,85,220,0.4)"
                          : "rgba(21,21,21,0.16)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Moments surfacing as the playhead crosses them. */}
          {MOMENTS.map((m, i) => {
            const trigger = 30 + m.at * 160;
            const p = spring({
              frame: frame - trigger,
              fps,
              config: { damping: 14, mass: 0.4 },
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 44,
                  left: BAR_WIDTH * m.at,
                  transform: `translate(-50%, ${(1 - p) * 26}px) scale(${p})`,
                  opacity: Math.min(1, p * 1.4),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: 15,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: brand.ink,
                    background: m.color,
                    padding: "5px 12px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    width: 2,
                    height: 30,
                    background: m.color,
                  }}
                />
              </div>
            );
          })}

          {/* Playhead */}
          <div
            style={{
              position: "absolute",
              top: 46,
              left: BAR_WIDTH * playhead,
              width: 3,
              height: 88,
              background: brand.ink,
              opacity: barIn,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 60,
            opacity: interpolate(frame, [196, 216], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontFamily: font.sans,
            fontSize: 34,
            fontWeight: 500,
            color: "rgba(21,21,21,0.55)",
            letterSpacing: "-0.02em",
          }}
        >
          Finding them by hand is the reason most of them stay buried.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
