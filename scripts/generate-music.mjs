#!/usr/bin/env node
/**
 * Generates the film's background score to `public/music.wav`.
 *
 * Written rather than licensed, for two reasons. First, provenance: this is a
 * commercial product promo, and a track synthesised here carries no third-party
 * rights to get wrong. Second, fit: the arrangement is keyed to the scene map in
 * `src/theme.ts`, so the pad opens on the cold open, the pulse enters with the
 * studio, the lift lands on the release scene and the whole thing resolves on
 * the closing card — a stock loop cannot do that.
 *
 * The mix is deliberately hollow through the 300 Hz–3 kHz vocal band: pads sit
 * low, sparkle sits high, and the narration occupies the gap without needing
 * sidechain ducking.
 *
 * Deterministic — same input, same bytes. Run with: npm run music
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "music.wav");

const RATE = 44100;
const DURATION = 88.5; // Film is 88.0s; the tail rings out past the last frame.
const N = Math.floor(RATE * DURATION);
const BPM = 84;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

/** Deterministic noise source — no Math.random, so renders are reproducible. */
let seed = 0x5eed1;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));
/** Smooth 0→1 ramp between two times. */
const ramp = (t, a, b) => clamp01((t - a) / (b - a));
/** Smoothstep, for automation that shouldn't have audible corners. */
const ease = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

/**
 * Harmony. A minor throughout, resolving to C major under the closing card —
 * unresolved while the film states the problem, settled once it has answered it.
 * Frequencies are split into a low pad register and a high sparkle register so
 * nothing crowds the voice.
 */
const CHORDS = [
  { pad: [110.0, 164.81, 220.0], hi: [659.25, 880.0] }, // Am
  { pad: [87.31, 130.81, 174.61], hi: [523.25, 698.46] }, // F
  { pad: [130.81, 196.0, 261.63], hi: [783.99, 1046.5] }, // C
  { pad: [98.0, 146.83, 196.0], hi: [587.33, 783.99] }, // G
];
const FINAL = { pad: [130.81, 196.0, 261.63], hi: [783.99, 1046.5] }; // C

/**
 * Arrangement automation, in seconds, matched to `scenes` in src/theme.ts.
 * Each returns 0–1 for that layer's presence at time t.
 */
const automation = {
  // Pad is always present; it swells as the film opens up.
  pad: (t) =>
    0.55 * ease(ramp(t, 0, 3.5)) +
    0.2 * ease(ramp(t, 14, 20)) +
    0.25 * ease(ramp(t, 60, 66)) -
    0.5 * ease(ramp(t, 84, 88.5)),

  // Sub pulse enters with the studio (14s) and steps back for the proof card.
  pulse: (t) =>
    ease(ramp(t, 14, 17)) -
    0.55 * ease(ramp(t, 72, 75)) +
    0.4 * ease(ramp(t, 80, 82)) -
    0.85 * ease(ramp(t, 85, 88)),

  // Sparkle arpeggio tracks the "intelligence" and "modes" acts.
  arp: (t) =>
    ease(ramp(t, 26, 29)) -
    0.45 * ease(ramp(t, 50, 53)) +
    0.45 * ease(ramp(t, 60, 63)) -
    0.9 * ease(ramp(t, 83, 87)),

  // Air: broadband hiss at the very edge of hearing, for depth.
  air: (t) => 0.6 * ease(ramp(t, 0, 6)) - 0.5 * ease(ramp(t, 84, 88.5)),
};

const chordAt = (t) => {
  if (t >= 78) return FINAL;
  return CHORDS[Math.floor(t / (BAR * 2)) % CHORDS.length];
};

/** Position within the current chord, 0–1, for per-chord swells. */
const chordPhase = (t) => (t % (BAR * 2)) / (BAR * 2);

const left = new Float64Array(N);
const right = new Float64Array(N);

// ── Pads ──────────────────────────────────────────────────────────────────
// Three detuned partials per note. The detune beats slowly against itself,
// which is what stops a sine stack sounding like a test tone.
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const gain = clamp01(automation.pad(t));
  if (gain <= 0) continue;

  const { pad } = chordAt(t);
  const swell = 0.75 + 0.25 * Math.sin(chordPhase(t) * Math.PI);
  let l = 0;
  let r = 0;

  pad.forEach((f, n) => {
    const drift = Math.sin(t * 0.19 + n * 1.7) * 0.12;
    const wob = 0.86 + 0.14 * Math.sin(t * 0.53 + n * 2.1);
    // Slight L/R detune spread gives width without a stereo effect.
    l += Math.sin(2 * Math.PI * (f - drift) * t) * wob;
    r += Math.sin(2 * Math.PI * (f + drift) * t) * wob;
    // One quiet octave-up partial keeps the pad from sounding muffled.
    l += Math.sin(2 * Math.PI * f * 2 * t + 0.4) * 0.16 * wob;
    r += Math.sin(2 * Math.PI * f * 2 * t + 0.9) * 0.16 * wob;
  });

  const k = (gain * swell) / (pad.length * 1.4);
  left[i] += l * k * 0.34;
  right[i] += r * k * 0.34;
}

// ── Sub pulse ─────────────────────────────────────────────────────────────
// A soft sine thump on beats 1 and 3 — felt more than heard at final level.
for (let beat = 0; beat * BEAT < DURATION; beat++) {
  if (beat % 2 !== 0) continue;
  const start = beat * BEAT;
  const gain = clamp01(automation.pulse(start));
  if (gain <= 0.01) continue;

  const len = Math.floor(RATE * 0.42);
  const i0 = Math.floor(start * RATE);
  const accent = beat % 8 === 0 ? 1 : 0.68;

  for (let j = 0; j < len && i0 + j < N; j++) {
    const u = j / len;
    const env = Math.exp(-u * 7.5) * (1 - Math.exp(-u * 220));
    // Pitch drops through the hit, which reads as weight rather than a beep.
    const f = 62 - 16 * u;
    const s = Math.sin(2 * Math.PI * f * (j / RATE)) * env * gain * accent * 0.5;
    left[i0 + j] += s;
    right[i0 + j] += s;
  }
}

// ── Sparkle arpeggio ──────────────────────────────────────────────────────
// Plucked eighth-notes in the high register, alternating across the stereo
// field so the top end moves while the pad stays still.
for (let step = 0; step * (BEAT / 2) < DURATION; step++) {
  const start = step * (BEAT / 2);
  const gain = clamp01(automation.arp(start));
  if (gain <= 0.02) continue;
  // Leave gaps: a note on every eighth would turn into a texture, not a motif.
  if (step % 4 === 1) continue;

  const { hi } = chordAt(start);
  const f = hi[step % hi.length] * (step % 8 === 0 ? 2 : 1);
  const len = Math.floor(RATE * 0.9);
  const i0 = Math.floor(start * RATE);
  const pan = step % 4 < 2 ? 0.34 : 0.66;

  for (let j = 0; j < len && i0 + j < N; j++) {
    const u = j / len;
    const env = Math.exp(-u * 5.2) * (1 - Math.exp(-u * 400));
    const s =
      (Math.sin(2 * Math.PI * f * (j / RATE)) +
        0.22 * Math.sin(2 * Math.PI * f * 2 * (j / RATE))) *
      env *
      gain *
      0.085;
    left[i0 + j] += s * (1 - pan);
    right[i0 + j] += s * pan;
  }
}

// ── Air ───────────────────────────────────────────────────────────────────
// One-pole high-passed noise. Adds the sense of a room without adding level.
let lastL = 0;
let lastR = 0;
let hpL = 0;
let hpR = 0;
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const gain = clamp01(automation.air(t));
  const nL = rand();
  const nR = rand();
  // High-pass: keep only what changed between samples.
  hpL = 0.97 * (hpL + nL - lastL);
  hpR = 0.97 * (hpR + nR - lastR);
  lastL = nL;
  lastR = nR;
  left[i] += hpL * gain * 0.006;
  right[i] += hpR * gain * 0.006;
}

// ── Master ────────────────────────────────────────────────────────────────
// Programme fades, then soft saturation instead of hard clipping so peaks
// round over rather than crack.
const fadeIn = 1.6;
const fadeOut = 2.6;
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const env =
    ease(ramp(t, 0, fadeIn)) * (1 - ease(ramp(t, DURATION - fadeOut, DURATION)));
  left[i] = Math.tanh(left[i] * env * 1.15);
  right[i] = Math.tanh(right[i] * env * 1.15);
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}

// Normalise to −3 dBFS. Level for the mix is set by `musicVolume` in audio.json.
const norm = peak > 0 ? 0.707 / peak : 1;

// ── WAV (16-bit PCM stereo) ───────────────────────────────────────────────
const dataBytes = N * 2 * 2;
const buf = Buffer.alloc(44 + dataBytes);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + dataBytes, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); // PCM chunk size
buf.writeUInt16LE(1, 20); // format: PCM
buf.writeUInt16LE(2, 22); // channels
buf.writeUInt32LE(RATE, 24);
buf.writeUInt32LE(RATE * 2 * 2, 28); // byte rate
buf.writeUInt16LE(4, 32); // block align
buf.writeUInt16LE(16, 34); // bits per sample
buf.write("data", 36);
buf.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < N; i++) {
  const l = Math.max(-1, Math.min(1, left[i] * norm));
  const r = Math.max(-1, Math.min(1, right[i] * norm));
  buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(r * 32767), 44 + i * 4 + 2);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, buf);

console.log(
  `\n✓ Score written to public/music.wav` +
    `\n  ${DURATION.toFixed(1)}s · ${RATE} Hz · stereo 16-bit · ${(
      buf.length /
      1024 /
      1024
    ).toFixed(1)} MB · ${BPM} BPM, A minor → C\n` +
    `  Enable it by setting "music": "music.wav" in src/audio.json.\n`,
);
