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

import { brand, font, motion } from "../theme";
import { Chapter } from "../components/Chapter";
import { Accent, Rise, Waveform } from "../components/primitives";

/**
 * Act 04 — Shaping, 0:50–1:00.
 *
 * The reframe shot. A 16:9 master narrows to 9:16 while the subject stays
 * inside the safe area and burned-in captions land word by word. The point is
 * that nothing is destroyed: the aspect chips and revision label stay visible
 * so the master is obviously still there underneath.
 */

/**
 * Kept short on purpose: the caption block has to stay legible inside the
 * 9:16 crop, which is only ~315px wide on this stage.
 */
const CAPTION_WORDS = ["The", "real", "problem", "was", "underneath."];

const ASPECTS = [
  { label: "16:9", ratio: 16 / 9 },
  { label: "1:1", ratio: 1 },
  { label: "9:16", ratio: 9 / 16 },
] as const;

/** Frame at which each aspect becomes active. */
const ASPECT_AT = [6, 66, 126];

const TRIM_WIDTH = 660;
const TRIM_IN = 0.22;
const TRIM_OUT = 0.74;

export const Edit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let aspectIndex = 0;
  for (let i = 0; i < ASPECT_AT.length; i++) {
    if (frame >= ASPECT_AT[i]) aspectIndex = i;
  }

  // Continuous ratio interpolation so the crop truly morphs rather than cuts.
  const ratio = interpolate(
    frame,
    [ASPECT_AT[0], ASPECT_AT[1], ASPECT_AT[1] + 18, ASPECT_AT[2], ASPECT_AT[2] + 18],
    [16 / 9, 16 / 9, 1, 1, 9 / 16],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const STAGE_H = 560;
  const frameWidth = STAGE_H * ratio;

  const panelIn = spring({ frame: frame - 3, fps, config: motion.glide });

  return (
    <AbsoluteFill>
      <Chapter
        index="04"
        eyebrow="Shape for every channel"
        outAt={240}
        copyRatio={0.33}
        background={brand.sky}
        headlineSize={78}
        headline={
          <span
            style={{
              fontFamily: font.sans,
              fontWeight: 600,
              fontSize: 78,
              letterSpacing: "-0.055em",
              color: brand.ink,
            }}
          >
            Shape it once. Let it <Accent>travel.</Accent>
          </span>
        }
        points={[
          "16:9, 1:1, and 9:16 natively",
          "Word-accurate burned-in captions",
          "Non-destructive, versioned edits",
        ]}
      >
        <div
          style={{
            width: "100%",
            background: brand.white,
            borderRadius: 32,
            padding: 26,
            boxShadow: "0 28px 80px rgba(57,92,115,0.18)",
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 26}px)`,
          }}
        >
          {/* ── Editor chrome ───────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 20,
              borderBottom: "1px solid rgba(21,21,21,0.1)",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: font.sans,
                  fontWeight: 600,
                  fontSize: 25,
                  color: brand.ink,
                  letterSpacing: "-0.02em",
                }}
              >
                The mistake that made our product better
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontFamily: font.mono,
                  fontSize: 16,
                  color: "rgba(21,21,21,0.45)",
                }}
              >
                clip revision v04 · master untouched
              </div>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              {ASPECTS.map((a, i) => (
                <span
                  key={a.label}
                  style={{
                    fontFamily: font.mono,
                    fontSize: 17,
                    padding: "10px 18px",
                    borderRadius: 999,
                    background:
                      i === aspectIndex ? brand.ink : "rgba(21,21,21,0.06)",
                    color:
                      i === aspectIndex ? brand.paper : "rgba(21,21,21,0.5)",
                  }}
                >
                  {a.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Preview stage ───────────────────────────────────────── */}
          <div
            style={{
              height: STAGE_H,
              margin: "22px 0",
              borderRadius: 20,
              background:
                "radial-gradient(circle at 50% 35%, rgba(99,85,220,0.1), transparent 34%), linear-gradient(145deg, #fbfaf7, #f1eff8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Discarded regions stay faintly visible: nothing is deleted. */}
            <Img
              src={staticFile("media/vora-clay-shape.webp")}
              style={{
                position: "absolute",
                height: STAGE_H,
                width: STAGE_H * (16 / 9),
                objectFit: "cover",
                opacity: 0.16,
                filter: "grayscale(1)",
              }}
            />

            <div
              style={{
                position: "relative",
                height: STAGE_H,
                width: frameWidth,
                overflow: "hidden",
                boxShadow: "0 0 0 3px rgba(21,21,21,0.9)",
              }}
            >
              <Img
                src={staticFile("media/vora-clay-shape.webp")}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  transform: "translateX(-50%)",
                  height: STAGE_H,
                  width: STAGE_H * (16 / 9),
                  objectFit: "cover",
                }}
              />

              {/* Safe area */}
              <div
                style={{
                  position: "absolute",
                  inset: "6% 8%",
                  border: "1px dashed rgba(21,21,21,0.28)",
                  borderRadius: 6,
                }}
              />

              {/* Burned-in captions */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 46,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 8,
                  padding: "0 24px",
                }}
              >
                {CAPTION_WORDS.map((word, i) => {
                  const p = spring({
                    frame: frame - 22 - i * 4,
                    fps,
                    config: motion.pop,
                  });
                  const isKey = word === "underneath" || word === "layer";
                  return (
                    <span
                      key={i}
                      style={{
                        fontFamily: font.sans,
                        fontWeight: 800,
                        fontSize: 27,
                        letterSpacing: "-0.02em",
                        color: isKey ? brand.ink : brand.white,
                        background: isKey ? brand.lime : "rgba(21,21,21,0.82)",
                        padding: "5px 12px",
                        borderRadius: 8,
                        opacity: p,
                        transform: `translateY(${(1 - p) * 14}px) scale(${
                          0.9 + p * 0.1
                        })`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Reframe readout */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 22,
                fontFamily: font.mono,
                fontSize: 16,
                color: "rgba(21,21,21,0.5)",
                background: "rgba(255,255,255,0.72)",
                padding: "8px 14px",
                borderRadius: 999,
              }}
            >
              subject tracked · fill canvas
            </div>
          </div>

          {/* ── Trim + presets ──────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: font.mono,
                  fontSize: 15,
                  color: "rgba(21,21,21,0.45)",
                  marginBottom: 9,
                }}
              >
                <span>in 12:08</span>
                <span>trim from transcript</span>
                <span>out 12:44</span>
              </div>
              {/*
                Width is fixed and shared by the waveform and the handles, so
                the in/out markers land exactly on the highlighted range.
              */}
              <div
                style={{
                  position: "relative",
                  width: TRIM_WIDTH,
                  padding: "8px 0",
                  borderRadius: 10,
                  background: "rgba(21,21,21,0.04)",
                }}
              >
                <Waveform
                  width={TRIM_WIDTH}
                  height={54}
                  bars={54}
                  from={TRIM_IN}
                  to={TRIM_OUT}
                />
                {[TRIM_IN, TRIM_OUT].map((x) => (
                  <span
                    key={x}
                    style={{
                      position: "absolute",
                      top: -5,
                      bottom: -5,
                      left: x * TRIM_WIDTH - 3,
                      width: 6,
                      borderRadius: 3,
                      background: brand.ink,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Bold focus", "Clean", "Boxed highlight", "High contrast"].map(
                (preset, i) => (
                  <Rise key={preset} index={i} delay={86} stagger={3}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: font.sans,
                        fontWeight: 600,
                        fontSize: 17,
                        padding: "9px 16px",
                        borderRadius: 999,
                        background: i === 0 ? brand.lime : "rgba(21,21,21,0.05)",
                        color: i === 0 ? brand.ink : "rgba(21,21,21,0.55)",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {preset}
                    </span>
                  </Rise>
                ),
              )}
            </div>
          </div>
        </div>
      </Chapter>
    </AbsoluteFill>
  );
};
