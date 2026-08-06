import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { brand, font } from "../theme";
import { Chapter } from "../components/Chapter";
import { Accent, Waveform } from "../components/primitives";

/**
 * Act 02 — Understanding, 0:26–0:40.
 *
 * The pipeline made visible. Three bands fill in the order the media worker
 * actually runs them: diarised transcript, sampled visual context, then
 * evidence-backed candidates. Each candidate carries the same fields the
 * product persists — range, confidence, and the reason it was chosen — because
 * "AI proposes, you decide" is only credible if the reasoning is on screen.
 */

const TRANSCRIPT = [
  { t: "12:02", s: "A", text: "We spent two quarters solving the visible problem." },
  { t: "12:11", s: "A", text: "Churn kept moving anyway." },
  { t: "12:18", s: "B", text: "So what actually changed?" },
  { t: "12:24", s: "A", text: "We were solving the visible problem." },
  { t: "12:31", s: "A", text: "The real one was a layer underneath it." },
  { t: "12:40", s: "B", text: "And that reframed the whole roadmap." },
] as const;

const CANDIDATES = [
  {
    title: "The mistake that made our product better",
    range: "12:08 — 12:44",
    score: 96,
    reason: "Strong reversal · complete thought · clean visual continuity",
    color: brand.lime,
  },
  {
    title: "From a failed launch to the idea that worked",
    range: "18:21 — 19:17",
    score: 93,
    reason: "Clear setup, turning point, and resolved ending",
    color: brand.violet,
  },
  {
    title: "Three lessons about building for real people",
    range: "24:02 — 25:06",
    score: 91,
    reason: "Three related ideas, paced as a concise list",
    color: brand.coral,
  },
] as const;

const STAGES = [
  "Probing",
  "Transcribing",
  "Understanding",
  "Finding stories",
] as const;

export const Understand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pipeline stage indicator, matched to what fills below it.
  const stageProgress = interpolate(frame, [10, 260], [0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Chapter
        index="02"
        eyebrow="Editorial intelligence"
        outAt={420}
        flip
        copyRatio={0.34}
        background={brand.violetSoft}
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
            AI that listens for <Accent>meaning.</Accent>
          </span>
        }
        points={[
          "Speaker, topic, and visual maps",
          "Evidence-backed clip scores",
          "Never invents what wasn’t said",
        ]}
      >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* ── Pipeline stages ─────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 12 }}>
            {STAGES.map((stage, i) => {
              const active = stageProgress > i;
              const done = stageProgress > i + 1;
              return (
                <div
                  key={stage}
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: 14,
                    background: active ? brand.white : "rgba(255,255,255,0.42)",
                    border: `1px solid ${
                      active ? "rgba(99,85,220,0.28)" : "rgba(21,21,21,0.08)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 6,
                      background: done
                        ? brand.violet
                        : active
                          ? brand.coral
                          : "rgba(21,21,21,0.16)",
                      opacity:
                        active && !done
                          ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.35, 1])
                          : 1,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontWeight: 600,
                      fontSize: 19,
                      color: active ? brand.ink : "rgba(21,21,21,0.42)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Transcript ──────────────────────────────────────────── */}
          <div
            style={{
              background: brand.white,
              borderRadius: 24,
              padding: "24px 28px",
              boxShadow: "0 20px 55px rgba(72,51,138,0.08)",
              height: 268,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: 15,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(21,21,21,0.45)",
                }}
              >
                Transcript · 2 speakers · en
              </span>
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: 15,
                  color: brand.violet,
                }}
              >
                word-level timestamps
              </span>
            </div>

            {TRANSCRIPT.map((line, i) => {
              const start = 16 + i * 13;
              const reveal = interpolate(frame - start, [0, 11], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const chars = Math.round(line.text.length * reveal);
              const highlighted = i >= 3 && frame > 150;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "baseline",
                    padding: "5px 10px",
                    marginLeft: -10,
                    borderRadius: 8,
                    opacity: reveal > 0 ? 1 : 0,
                    background: highlighted
                      ? "rgba(199,255,74,0.36)"
                      : "transparent",
                    transition: "background 200ms",
                  }}
                >
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontSize: 16,
                      color: "rgba(21,21,21,0.38)",
                      minWidth: 58,
                    }}
                  >
                    {line.t}
                  </span>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 14,
                      background: line.s === "A" ? brand.violet : brand.coral,
                      color: brand.white,
                      fontFamily: font.sans,
                      fontWeight: 700,
                      fontSize: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {line.s}
                  </span>
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontSize: 23,
                      fontWeight: 500,
                      color: "rgba(21,21,21,0.85)",
                      letterSpacing: "-0.012em",
                    }}
                  >
                    {line.text.slice(0, chars)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Visual sampling ─────────────────────────────────────── */}
          <div
            style={{
              background: brand.white,
              borderRadius: 24,
              padding: "20px 28px",
              boxShadow: "0 20px 55px rgba(72,51,138,0.08)",
              opacity: interpolate(frame, [104, 124], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
                fontFamily: font.mono,
                fontSize: 15,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(21,21,21,0.45)",
              }}
            >
              <span>Visual context · keyframes</span>
              <span style={{ color: brand.violet }}>
                slide · speaker · demo · slide
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {Array.from({ length: 18 }).map((_, i) => {
                const scanned = interpolate(
                  frame - 118 - i * 3.4,
                  [0, 10],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                const isScene = i === 4 || i === 9 || i === 14;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 6,
                      background: isScene
                        ? `rgba(99,85,220,${0.18 + 0.5 * scanned})`
                        : `rgba(21,21,21,${0.05 + 0.06 * scanned})`,
                      border: isScene
                        ? `2px solid rgba(99,85,220,${0.7 * scanned})`
                        : "1px solid rgba(21,21,21,0.07)",
                    }}
                  />
                );
              })}
            </div>
            <Waveform width={1000} height={40} bars={72} from={0.24} to={0.46} />
          </div>

          {/* ── Candidates ──────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 14 }}>
            {CANDIDATES.map((c, i) => {
              const p = spring({
                frame: frame - 196 - i * 16,
                fps,
                config: { damping: 16, mass: 0.55 },
              });
              const scoreP = interpolate(
                frame - 214 - i * 16,
                [0, 30],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <div
                  key={c.title}
                  style={{
                    flex: 1,
                    background: brand.white,
                    borderRadius: 22,
                    padding: "22px 24px",
                    boxShadow: "0 20px 55px rgba(72,51,138,0.1)",
                    opacity: p,
                    transform: `translateY(${(1 - p) * 34}px)`,
                    borderTop: `4px solid ${c.color}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: font.mono,
                      fontSize: 15,
                      color: "rgba(21,21,21,0.45)",
                    }}
                  >
                    <span>{c.range}</span>
                    <span
                      style={{
                        color: brand.violet,
                        fontFamily: font.sans,
                        fontWeight: 700,
                        fontSize: 24,
                      }}
                    >
                      {Math.round(c.score * scoreP)}%
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: font.sans,
                      fontWeight: 600,
                      fontSize: 25,
                      lineHeight: 1.16,
                      letterSpacing: "-0.03em",
                      color: brand.ink,
                      minHeight: 88,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: "rgba(21,21,21,0.08)",
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${c.score * scoreP}%`,
                        background: brand.violet,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: font.sans,
                      fontSize: 17,
                      lineHeight: 1.45,
                      color: "rgba(21,21,21,0.55)",
                    }}
                  >
                    {c.reason}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Chapter>
    </AbsoluteFill>
  );
};
