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
import {
  CheckIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  YouTubeIcon,
} from "../components/brand-icons";
import { Accent, useCountUp } from "../components/primitives";

/**
 * Act 05 — Release, 1:00–1:12.
 *
 * The approval gate is the hero of this scene, not the automation. Targets
 * validate one at a time, preflight counts to 12/12, and only then does the
 * plan flip to Approved — the same order the product enforces server-side.
 */

const TARGETS = [
  {
    name: "YouTube",
    Icon: YouTubeIcon,
    tint: "#ff4d3d",
    format: "9:16 · Captions on",
    when: "Today",
    at: "18:30",
    state: "Ready",
  },
  {
    name: "Instagram",
    Icon: InstagramIcon,
    tint: "#ef77c8",
    format: "1:1 · Native copy",
    when: "Today",
    at: "19:15",
    state: "Ready",
  },
  {
    name: "LinkedIn",
    Icon: LinkedInIcon,
    tint: brand.skyMid,
    format: "9:16 · Captions on",
    when: "Tomorrow",
    at: "08:45",
    state: "Scheduled",
  },
  {
    name: "TikTok",
    Icon: TikTokIcon,
    tint: brand.lime,
    format: "1:1 · Native copy",
    when: "Tomorrow",
    at: "12:00",
    state: "Scheduled",
  },
] as const;

export const Publish: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200, mass: 1 },
  });

  const preflight = useCountUp(12, 178, 46);
  const approved = frame > 236;
  const approveP = spring({
    frame: frame - 236,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  return (
    <AbsoluteFill>
      <Chapter
        index="05"
        eyebrow="Release control"
        outAt={360}
        flip
        copyRatio={0.34}
        background={brand.coralSoft}
        headlineSize={80}
        headline={
          <span
            style={{
              fontFamily: font.sans,
              fontWeight: 600,
              fontSize: 80,
              letterSpacing: "-0.058em",
              color: brand.ink,
            }}
          >
            One story. <Accent color={brand.ink}>Everywhere it belongs.</Accent>
          </span>
        }
        points={[
          "Per-channel copy and formats",
          "Publish now or schedule ahead",
          "Nothing ships without your approval",
        ]}
      >
        <div
          style={{
            width: "100%",
            background: brand.paper,
            border: `2px solid ${brand.ink}`,
            borderRadius: 30,
            boxShadow: `14px 16px 0 ${brand.ink}`,
            padding: 34,
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 30}px)`,
          }}
        >
          {/* ── Plan header ─────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 22,
              borderBottom: "1px solid rgba(21,21,21,0.18)",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: font.sans,
                  fontWeight: 600,
                  fontSize: 28,
                  color: brand.ink,
                  letterSpacing: "-0.02em",
                }}
              >
                Release plan
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: font.mono,
                  fontSize: 17,
                  color: "rgba(21,21,21,0.55)",
                }}
              >
                The mistake that made our product better / v04
              </div>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                padding: "12px 22px",
                fontFamily: font.sans,
                fontWeight: 700,
                fontSize: 21,
                background: approved ? brand.lime : "rgba(21,21,21,0.07)",
                color: approved ? brand.ink : "rgba(21,21,21,0.45)",
                transform: `scale(${approved ? 0.94 + approveP * 0.06 : 1})`,
              }}
            >
              {approved ? <CheckIcon size={19} color={brand.ink} /> : null}
              {approved ? "Approved by you" : "Awaiting approval"}
            </div>
          </div>

          {/* ── Targets ─────────────────────────────────────────────── */}
          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {TARGETS.map((target, i) => {
              const p = spring({
                frame: frame - 44 - i * 18,
                fps,
                config: { damping: 16, mass: 0.55 },
              });
              const validated = frame > 120 + i * 14;
              return (
                <div
                  key={target.name}
                  style={{
                    borderRadius: 20,
                    border: "1px solid rgba(21,21,21,0.16)",
                    background: brand.white,
                    padding: "22px 24px",
                    opacity: p,
                    transform: `translateY(${(1 - p) * 22}px)`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 24,
                        background: target.tint,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <target.Icon size={22} color={brand.ink} />
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: font.mono,
                        fontSize: 14,
                        textTransform: "uppercase",
                        letterSpacing: "0.13em",
                        color: validated
                          ? brand.ink
                          : "rgba(21,21,21,0.32)",
                      }}
                    >
                      {validated ? (
                        <CheckIcon size={14} color={brand.violet} />
                      ) : (
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 7,
                            border: "2px solid rgba(21,21,21,0.25)",
                            borderTopColor: brand.violet,
                            transform: `rotate(${frame * 12}deg)`,
                          }}
                        />
                      )}
                      {validated ? target.state : "Validating"}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 20,
                      fontFamily: font.sans,
                      fontWeight: 600,
                      fontSize: 25,
                      color: brand.ink,
                    }}
                  >
                    {target.name}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontFamily: font.sans,
                      fontSize: 18,
                      color: "rgba(21,21,21,0.55)",
                    }}
                  >
                    {target.format}
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 14,
                      borderTop: "1px solid rgba(21,21,21,0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: font.mono,
                      fontSize: 17,
                      color: "rgba(21,21,21,0.7)",
                    }}
                  >
                    <span>{target.when}</span>
                    <span>{target.at}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Preflight ───────────────────────────────────────────── */}
          <div
            style={{
              marginTop: 20,
              borderRadius: 20,
              background: brand.ink,
              color: brand.white,
              padding: "24px 28px",
              opacity: interpolate(frame, [166, 186], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
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
                  fontSize: 23,
                }}
              >
                Preflight
              </span>
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: 21,
                  color: brand.lime,
                }}
              >
                {preflight} / 12
              </span>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
              }}
            >
              {[
                "Render ready",
                "Safe zones",
                "Channel limits",
                "Token health",
              ].map((check, i) => {
                const done = preflight >= (i + 1) * 3;
                return (
                  <span
                    key={check}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      fontFamily: font.sans,
                      fontSize: 18,
                      color: done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.32)",
                    }}
                  >
                    <CheckIcon
                      size={15}
                      color={done ? brand.lime : "rgba(255,255,255,0.25)"}
                    />
                    {check}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Chapter>
    </AbsoluteFill>
  );
};
