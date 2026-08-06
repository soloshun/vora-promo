import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { brand, font } from "../theme";
import { Accent, MaskedLines, Rise } from "../components/primitives";

/**
 * Act 03 — Clipping modes, 0:40–0:50.
 *
 * The one interactive idea the film has to land: the mode does not relabel the
 * output, it changes the evidence Vora looks for. Selection walks the four
 * modes on a fixed cadence and every dependent surface — image, quote, range,
 * confidence, waveform accent — re-keys with it.
 */

const MODES = [
  {
    id: "moments",
    label: "Best moments",
    description: "Surface the strongest standalone ideas.",
    eyebrow: "High-retention insight",
    title: "The mistake that made our product better",
    quote:
      "We were solving the visible problem. The real problem was one layer underneath it.",
    reason: "Strong reversal, complete thought, clean visual continuity",
    range: "12:08 — 12:44",
    score: 96,
    accent: brand.lime,
    image: "media/vora-clay-discover.webp",
    bars: [35, 48, 82, 62, 94, 70, 54, 88, 66, 44, 72, 91, 57, 38],
  },
  {
    id: "stories",
    label: "Story arcs",
    description: "Keep setup, turn, and resolution together.",
    eyebrow: "Complete narrative",
    title: "From a failed launch to the idea that worked",
    quote:
      "The launch missed. That forced us to listen differently — and the next version finally clicked.",
    reason: "Clear setup, turning point, and resolved ending",
    range: "18:21 — 19:17",
    score: 93,
    accent: "#7c6cff",
    image: "media/vora-clay-story-arcs.webp",
    bars: [52, 62, 44, 76, 88, 58, 42, 70, 96, 82, 60, 48, 76, 64],
  },
  {
    id: "topics",
    label: "Topic stack",
    description: "Group related insights into a sequence.",
    eyebrow: "Thematic collection",
    title: "Three lessons about building for real people",
    quote:
      "Watch behaviour. Name the tension. Make the first useful version smaller than feels comfortable.",
    reason: "Three related ideas, paced as a concise list",
    range: "24:02 — 25:06",
    score: 91,
    accent: brand.coral,
    image: "media/vora-clay-topic-stack.webp",
    bars: [68, 44, 74, 92, 56, 46, 82, 60, 90, 52, 78, 96, 64, 48],
  },
  {
    id: "tutorial",
    label: "Tutorial cuts",
    description: "Preserve the steps people need to follow.",
    eyebrow: "Actionable sequence",
    title: "Build a publish-ready clip in three moves",
    quote:
      "Choose the story, lock the frame, then tailor the packaging for each destination.",
    reason: "Ordered steps, legible screen context, no missing action",
    range: "31:14 — 32:02",
    score: 89,
    accent: "#54a7ff",
    image: "media/vora-clay-tutorial-cuts.webp",
    bars: [40, 72, 58, 86, 68, 92, 48, 78, 62, 88, 54, 76, 96, 58],
  },
] as const;

const SWITCH_AT = [26, 92, 158, 224];

export const ClipModes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let active = 0;
  for (let i = 0; i < SWITCH_AT.length; i++) {
    if (frame >= SWITCH_AT[i]) active = i;
  }
  const mode = MODES[active];
  const sinceSwitch = frame - SWITCH_AT[active];

  // Re-entry animation for every mode-dependent surface.
  const swap = spring({
    frame: sinceSwitch,
    fps,
    config: { damping: 200, mass: 0.5 },
  });

  const out = interpolate(frame, [300, 318], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 82% 0%, rgba(99,85,220,0.28), transparent 46%), #131218",
        padding: "76px 104px",
        opacity: 1 - out,
        transform: `scale(${1 - out * 0.02})`,
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 60,
          marginBottom: 44,
        }}
      >
        <div>
          <Rise delay={2}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontFamily: font.mono,
                fontSize: 21,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "rgba(245,242,234,0.55)",
                marginBottom: 26,
              }}
            >
              <span style={{ color: brand.lime }}>03</span>
              <span
                style={{
                  width: 46,
                  height: 1,
                  background: "rgba(245,242,234,0.2)",
                }}
              />
              Four ways to listen
            </div>
          </Rise>
          <MaskedLines
            fontSize={96}
            delay={8}
            lines={[
              <span
                key="h"
                style={{
                  fontFamily: font.sans,
                  fontWeight: 600,
                  fontSize: 96,
                  letterSpacing: "-0.06em",
                  color: brand.paper,
                }}
              >
                Choose how Vora <Accent color={brand.lime}>listens.</Accent>
              </span>,
            ]}
          />
        </div>
        <Rise
          delay={18}
          style={{
            maxWidth: 480,
            fontFamily: font.sans,
            fontSize: 25,
            lineHeight: 1.55,
            color: "rgba(245,242,234,0.55)",
            paddingBottom: 12,
          }}
        >
          The mode changes the evidence, pacing, and boundaries Vora looks for —
          not just the label on the result.
        </Rise>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 24, height: 706 }}>
        {/* Mode selector */}
        <div
          style={{
            width: 380,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {MODES.map((m, i) => {
            const isActive = i === active;
            return (
              <Rise
                key={m.id}
                index={i}
                delay={16}
                stagger={5}
                style={{ flex: 1, display: "flex" }}
              >
                <div
                  style={{
                    flex: 1,
                    borderRadius: 22,
                    padding: "22px 26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    background: isActive ? brand.paper : "rgba(255,255,255,0.05)",
                    border: `1px solid ${
                      isActive ? brand.paper : "rgba(255,255,255,0.11)"
                    }`,
                    color: isActive ? brand.ink : "rgba(245,242,234,0.8)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {isActive ? (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        background: m.accent,
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontWeight: 600,
                      fontSize: 27,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      marginTop: 8,
                      fontFamily: font.sans,
                      fontSize: 18,
                      lineHeight: 1.4,
                      opacity: 0.58,
                    }}
                  >
                    {m.description}
                  </span>
                </div>
              </Rise>
            );
          })}
        </div>

        {/* Mode illustration */}
        <Rise
          delay={14}
          style={{
            width: 470,
            borderRadius: 30,
            overflow: "hidden",
            position: "relative",
            border: "6px solid rgba(255,255,255,0.9)",
            background: brand.sky,
          }}
        >
          <Img
            key={mode.id}
            src={staticFile(mode.image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: swap,
              transform: `scale(${1.04 - swap * 0.04})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              bottom: 22,
              background: "rgba(255,255,255,0.94)",
              borderRadius: 20,
              padding: "18px 22px",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: font.sans,
                  fontWeight: 600,
                  fontSize: 19,
                  color: brand.ink,
                }}
              >
                Editorial confidence
              </span>
              <span
                style={{
                  fontFamily: font.sans,
                  fontWeight: 700,
                  fontSize: 30,
                  color: brand.violet,
                }}
              >
                {Math.round(mode.score * swap)}%
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                height: 7,
                borderRadius: 4,
                background: "rgba(21,21,21,0.09)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${mode.score * swap}%`,
                  background: brand.violet,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </Rise>

        {/* Result */}
        <Rise
          delay={20}
          style={{
            flex: 1,
            background: brand.paper,
            borderRadius: 30,
            padding: "34px 38px",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: swap,
            }}
          >
            <span
              style={{
                fontFamily: font.sans,
                fontWeight: 700,
                fontSize: 20,
                color: brand.violet,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {mode.eyebrow}
            </span>
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 18,
                background: brand.violetSoft,
                color: "rgba(21,21,21,0.6)",
                borderRadius: 999,
                padding: "8px 16px",
              }}
            >
              {mode.range}
            </span>
          </div>

          <div
            style={{
              marginTop: 26,
              fontFamily: font.sans,
              fontWeight: 600,
              fontSize: 50,
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              color: brand.ink,
              opacity: swap,
              transform: `translateY(${(1 - swap) * 16}px)`,
              minHeight: 150,
            }}
          >
            {mode.title}
          </div>

          <div
            style={{
              marginTop: 8,
              borderLeft: `3px solid ${brand.violet}`,
              paddingLeft: 22,
              fontFamily: font.sans,
              fontSize: 25,
              lineHeight: 1.55,
              color: "rgba(21,21,21,0.62)",
              opacity: swap,
            }}
          >
            “{mode.quote}”
          </div>

          <div
            style={{
              marginTop: 28,
              paddingTop: 22,
              borderTop: "1px solid rgba(21,21,21,0.12)",
              opacity: swap,
            }}
          >
            <div
              style={{
                fontFamily: font.mono,
                fontSize: 15,
                textTransform: "uppercase",
                letterSpacing: "0.13em",
                color: "rgba(21,21,21,0.55)",
              }}
            >
              Why Vora chose it
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: font.sans,
                fontSize: 22,
                lineHeight: 1.45,
                color: "rgba(21,21,21,0.72)",
              }}
            >
              {mode.reason}
            </div>
          </div>

          {/* Boundary waveform: where the story starts and resolves. */}
          <div style={{ marginTop: "auto", paddingTop: 26 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 7,
                height: 92,
              }}
            >
              {mode.bars.map((bar, i) => {
                const inRange = i > 2 && i < 11;
                const grow = interpolate(
                  sinceSwitch - i * 1.6,
                  [0, 12],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                return (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(14, bar) * grow}%`,
                      borderRadius: 5,
                      background: inRange ? mode.accent : "rgba(21,21,21,0.1)",
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: font.mono,
                fontSize: 16,
                color: "rgba(21,21,21,0.5)",
              }}
            >
              <span>Story begins</span>
              <span>Clean resolution</span>
            </div>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
