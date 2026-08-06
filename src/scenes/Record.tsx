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
import { Chapter } from "../components/Chapter";
import { AudioMeter, Rise } from "../components/primitives";

/**
 * Act 01 — Capture, 0:14–0:26.
 *
 * The studio stage: a composited screen + camera scene with live safe-area
 * guides, signal meters, and the local chunk-recovery trail ticking up. The
 * recovery counter is the point of the shot — it is what separates the product
 * from a browser recorder.
 */

const CHUNK_INTERVAL = 6; // frames between persisted chunks (~2s of media)

export const Record: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stageIn = spring({
    frame: frame - 14,
    fps,
    config: { damping: 200, mass: 0.9 },
  });

  // Recording begins at frame 40 after a short countdown.
  const recFrame = Math.max(0, frame - 40);
  const seconds = recFrame / fps;
  const timecode = `00:${String(Math.floor(seconds / 60)).padStart(
    2,
    "0",
  )}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  const chunks = Math.floor(recFrame / CHUNK_INTERVAL);
  const recording = frame >= 40;

  const blink = interpolate(Math.sin(frame * 0.34), [-1, 1], [0.3, 1]);

  return (
    <AbsoluteFill>
      <Chapter
        index="01"
        eyebrow="Capture"
        outAt={360}
        copyRatio={0.35}
        dark
        background={`radial-gradient(circle at 14% 6%, rgba(99,85,220,0.22), transparent 42%), linear-gradient(150deg, #1b1830 0%, #141319 52%, #1d1518 100%)`}
        headlineSize={82}
        headline={
          <span
            style={{
              fontFamily: font.sans,
              fontWeight: 600,
              fontSize: 82,
              letterSpacing: "-0.055em",
              color: brand.paper,
            }}
          >
            A studio that stays out of the way.
          </span>
        }
        points={[
          "Screen, camera, and microphone scenes",
          "Independent signal monitoring",
          "Crash-safe local chunk recovery",
        ]}
      >
        <div
          style={{
            width: "100%",
            opacity: stageIn,
            transform: `translateY(${(1 - stageIn) * 28}px)`,
          }}
        >
          {/* ── Stage ───────────────────────────────────────────────── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 26,
              overflow: "hidden",
              background:
                "radial-gradient(circle at 50% 34%, rgba(199,255,74,0.07), transparent 32%), linear-gradient(145deg, #17151d, #0e0d12)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 40px 110px rgba(0,0,0,0.5)",
            }}
          >
            {/* Shared screen: a mock analytics surface, deliberately generic. */}
            <div
              style={{
                position: "absolute",
                inset: 34,
                borderRadius: 14,
                background: "#1c1a24",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "0 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {[brand.coral, "#f7c948", brand.lime].map((c) => (
                  <span
                    key={c}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 6,
                      background: c,
                      opacity: 0.75,
                    }}
                  />
                ))}
                <span
                  style={{
                    marginLeft: 16,
                    fontFamily: font.mono,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  retention / cohort-view
                </span>
              </div>

              <div style={{ padding: "26px 28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 10,
                    height: 168,
                  }}
                >
                  {Array.from({ length: 26 }).map((_, i) => {
                    const grow = interpolate(
                      frame - 30 - i * 2.2,
                      [0, 22],
                      [0, 1],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    );
                    const h =
                      26 +
                      64 *
                        Math.abs(
                          Math.sin(i * 0.44) * 0.6 + Math.sin(i * 0.19) * 0.4,
                        );
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${h * grow}%`,
                          borderRadius: 4,
                          background:
                            i > 17
                              ? "rgba(199,255,74,0.7)"
                              : "rgba(124,108,255,0.55)",
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    gap: 12,
                  }}
                >
                  {["Week 1", "Week 6", "Week 12"].map((l) => (
                    <span
                      key={l}
                      style={{
                        flex: 1,
                        fontFamily: font.mono,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.28)",
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Safe-area guides */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(frame, [56, 76], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "31.5%",
                  right: "31.5%",
                  border: "1px dashed rgba(255,255,255,0.24)",
                  borderRadius: 8,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: font.mono,
                  fontSize: 13,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                9:16 safe area
              </span>
            </div>

            {/* Camera picture-in-picture */}
            <div
              style={{
                position: "absolute",
                left: 62,
                bottom: 62,
                width: 210,
                height: 210,
                borderRadius: 110,
                overflow: "hidden",
                border: `3px solid ${recording ? brand.lime : "rgba(255,255,255,0.3)"}`,
                boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                transform: `scale(${spring({
                  frame: frame - 24,
                  fps,
                  config: { damping: 13, mass: 0.5 },
                })})`,
              }}
            >
              <Img
                src={staticFile("media/vora-clay-capture.webp")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Recording chip — top-right, clear of the shared window's chrome. */}
            <div
              style={{
                position: "absolute",
                top: 58,
                right: 58,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 22px",
                borderRadius: 999,
                background: recording ? brand.coral : "rgba(0,0,0,0.5)",
                color: recording ? "#1a0c08" : "rgba(255,255,255,0.75)",
                fontFamily: font.sans,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.1em",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 7,
                  background: recording ? "#3d0f04" : "rgba(255,255,255,0.6)",
                  opacity: recording ? blink : 1,
                }}
              />
              {recording ? "REC" : "READY"}
              <span
                style={{
                  fontFamily: font.mono,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                {timecode}
              </span>
            </div>

            {/* Live meter */}
            <div
              style={{
                position: "absolute",
                right: 62,
                bottom: 62,
                padding: "18px 22px",
                borderRadius: 18,
                background: "rgba(0,0,0,0.46)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 12,
                }}
              >
                Mic · Display audio
              </div>
              <AudioMeter
                width={250}
                height={52}
                bars={24}
                active={recording}
                color={brand.lime}
              />
            </div>
          </div>

          {/* ── Recovery trail ──────────────────────────────────────── */}
          <div
            style={{
              marginTop: 26,
              display: "flex",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <Rise
              delay={64}
              style={{
                flex: 1.35,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 14,
                padding: "22px 26px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: font.sans,
                    fontWeight: 600,
                    fontSize: 21,
                    color: "rgba(245,242,234,0.9)",
                  }}
                >
                  Local recovery
                </span>
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: 20,
                    color: brand.lime,
                  }}
                >
                  {chunks} chunks saved
                </span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: 42 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      height: 12,
                      borderRadius: 3,
                      background:
                        i < chunks
                          ? brand.lime
                          : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
            </Rise>

            {[
              { label: "1080p · 30fps", value: "Scene locked" },
              { label: "Quota", value: "12.4 GB free" },
            ].map((chip, i) => (
              <Rise
                key={chip.label}
                index={i}
                delay={72}
                stagger={6}
                style={{
                  flex: 0.62,
                  padding: "22px 24px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.13em",
                    color: "rgba(255,255,255,0.42)",
                  }}
                >
                  {chip.label}
                </span>
                <span
                  style={{
                    fontFamily: font.sans,
                    fontWeight: 600,
                    fontSize: 22,
                    color: "rgba(245,242,234,0.92)",
                  }}
                >
                  {chip.value}
                </span>
              </Rise>
            ))}
          </div>
        </div>
      </Chapter>
    </AbsoluteFill>
  );
};
