#!/usr/bin/env node
/**
 * Generates the film's score to `public/music.wav`.
 *
 * Written rather than licensed, for two reasons. First, provenance: this is a
 * commercial product promo, and a synthesised track carries no third-party
 * rights to get wrong. Second, fit: the arrangement is keyed to the scene map
 * in `src/theme.ts`, so the groove drops in with the studio, peaks across the
 * clipping modes, breaks for the proof card and lands its final hit on the
 * closing lockup. A stock loop cannot do that.
 *
 * The track is a driving 120 BPM — four-on-the-floor kick, sixteenth hats,
 * eighth-note bass, off-beat stabs and a sixteenth arp — because the cut is
 * fast and a slow bed fought it. The mix is still deliberately hollow through
 * the 300 Hz–3 kHz vocal band: weight sits under it, movement sits over it, and
 * the narration occupies the gap without needing sidechain ducking.
 *
 * Deterministic — same input, same bytes. Run with: npm run music
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "music.wav");

const RATE = 44100;
const DURATION = 64.6; // Film is 64.0s; the tail rings out past the last frame.
const N = Math.floor(RATE * DURATION);

const BPM = 120;
const BEAT = 60 / BPM; // 0.5s
const BAR = BEAT * 4; // 2.0s — 60 frames at 30fps
const SIXTEENTH = BEAT / 4;

/** Deterministic noise — no Math.random, so renders are reproducible. */
let seed = 0x5eed1;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (t, a, b) => clamp01((t - a) / (b - a));
const ease = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

/**
 * Harmony: Am – F – C – G, one chord per bar, resolving to C major under the
 * closing card. Bass and pad sit low, the arp sits high, and nothing is written
 * into the middle where the voice lives.
 */
const PROGRESSION = [
  { root: 55.0, pad: [110.0, 164.81, 220.0], hi: [880.0, 1046.5, 1318.5] }, // Am
  { root: 43.65, pad: [87.31, 130.81, 174.61], hi: [698.46, 880.0, 1046.5] }, // F
  { root: 65.41, pad: [130.81, 196.0, 261.63], hi: [1046.5, 1318.5, 1568.0] }, // C
  { root: 49.0, pad: [98.0, 146.83, 196.0], hi: [783.99, 987.77, 1174.7] }, // G
];
const FINAL = PROGRESSION[2]; // C

const chordAt = (t) =>
  t >= 58 ? FINAL : PROGRESSION[Math.floor(t / BAR) % PROGRESSION.length];

/**
 * Arrangement automation, in seconds, matched to `scenes` in src/theme.ts:
 * coldOpen 0–3 · problem 3–10 · record 10–18 · understand 18–28 ·
 * clipModes 28–36 · edit 36–44 · publish 44–53 · proof 53–58 · cta 58–64.
 *
 * Each returns 0–1 for that layer's presence at time t.
 */
const automation = {
  // Kick holds the whole film together; it only steps out for the proof card.
  kick: (t) =>
    ease(ramp(t, 2.4, 3.2)) -
    0.85 * ease(ramp(t, 53, 53.6)) +
    0.85 * ease(ramp(t, 57.4, 58)) -
    ease(ramp(t, 62.5, 64)),

  // Hats carry the sense of speed. They enter early and thin out on the break.
  hat: (t) =>
    ease(ramp(t, 1.6, 3)) -
    0.7 * ease(ramp(t, 53, 53.5)) +
    0.7 * ease(ramp(t, 58, 58.4)) -
    ease(ramp(t, 62, 63.5)),

  bass: (t) =>
    ease(ramp(t, 9.6, 10.4)) -
    0.9 * ease(ramp(t, 53, 53.5)) +
    0.9 * ease(ramp(t, 57.8, 58.2)) -
    ease(ramp(t, 62.5, 64)),

  // Arp lands with the intelligence act and peaks across the clipping modes.
  arp: (t) =>
    0.7 * ease(ramp(t, 17.6, 18.4)) +
    0.3 * ease(ramp(t, 28, 28.6)) -
    0.5 * ease(ramp(t, 44, 44.6)) +
    0.5 * ease(ramp(t, 58, 58.4)) -
    ease(ramp(t, 62, 63.5)),

  // Off-beat stabs give the groove its bounce.
  stab: (t) =>
    ease(ramp(t, 9.6, 10.4)) -
    ease(ramp(t, 53, 53.5)) +
    ease(ramp(t, 58, 58.4)) -
    ease(ramp(t, 62, 63.5)),

  // Pad is the constant underneath everything.
  pad: (t) => 0.5 * ease(ramp(t, 0, 2)) + 0.5 * ease(ramp(t, 43.6, 44.4)),
};

const left = new Float64Array(N);
const right = new Float64Array(N);

const add = (i, l, r) => {
  if (i < 0 || i >= N) return;
  left[i] += l;
  right[i] += r;
};

// ── Pad ───────────────────────────────────────────────────────────────────
// Detuned partials, slowly beating against each other so the bed has motion
// even where nothing else is playing.
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const g = clamp01(automation.pad(t));
  if (g <= 0) continue;
  const { pad } = chordAt(t);
  let l = 0;
  let r = 0;
  pad.forEach((f, n) => {
    const d = Math.sin(t * 0.31 + n * 1.7) * 0.16;
    const w = 0.85 + 0.15 * Math.sin(t * 0.77 + n * 2.1);
    l += Math.sin(2 * Math.PI * (f - d) * t) * w;
    r += Math.sin(2 * Math.PI * (f + d) * t) * w;
  });
  const k = (g * 0.2) / pad.length;
  left[i] += l * k;
  right[i] += r * k;
}

// ── Kick: four on the floor ───────────────────────────────────────────────
for (let b = 0; b * BEAT < DURATION; b++) {
  const start = b * BEAT;
  const g = clamp01(automation.kick(start));
  if (g <= 0.02) continue;
  const i0 = Math.floor(start * RATE);
  const len = Math.floor(RATE * 0.3);
  const accent = b % 4 === 0 ? 1 : 0.82;
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const env = Math.exp(-u * 12) * (1 - Math.exp(-u * 900));
    // Pitch sweep from click to body — reads as weight, not a beep.
    const f = 110 - 62 * Math.min(1, u * 6);
    const s = Math.sin(2 * Math.PI * f * (j / RATE)) * env * g * accent * 0.92;
    add(i0 + j, s, s);
  }
}

// ── Hats: sixteenths, alternating across the field ────────────────────────
for (let s16 = 0; s16 * SIXTEENTH < DURATION; s16++) {
  const start = s16 * SIXTEENTH;
  const g = clamp01(automation.hat(start));
  if (g <= 0.02) continue;
  const i0 = Math.floor(start * RATE);
  const onBeat = s16 % 4 === 0;
  const open = s16 % 8 === 4; // one longer hat per beat-pair, for swing
  const len = Math.floor(RATE * (open ? 0.13 : 0.045));
  const level = (onBeat ? 0.32 : open ? 0.4 : 0.24) * g * 0.24;
  const pan = s16 % 2 === 0 ? 0.42 : 0.58;
  let hp = 0;
  let last = 0;
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const env = Math.exp(-u * (open ? 9 : 26));
    const n = rand();
    hp = 0.86 * (hp + n - last); // high-pass: keeps only the sizzle
    last = n;
    const s = hp * env * level;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2);
  }
}

// ── Bass: eighth notes on the chord root ──────────────────────────────────
for (let e = 0; e * (BEAT / 2) < DURATION; e++) {
  const start = e * (BEAT / 2);
  const g = clamp01(automation.bass(start));
  if (g <= 0.02) continue;
  // Leave the last eighth of each bar open so the line breathes.
  if (e % 8 === 7) continue;
  const { root } = chordAt(start);
  const i0 = Math.floor(start * RATE);
  const len = Math.floor(RATE * 0.22);
  const octave = e % 8 === 6 ? 2 : 1; // small octave lift for movement
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const env = Math.exp(-u * 6) * (1 - Math.exp(-u * 320));
    const ph = 2 * Math.PI * root * octave * (j / RATE);
    // Sine plus a soft third harmonic: audible on small speakers.
    const s =
      (Math.sin(ph) + 0.3 * Math.sin(ph * 3) + 0.14 * Math.sin(ph * 2)) *
      env *
      g *
      0.3;
    add(i0 + j, s, s);
  }
}

// ── Stabs: chord on the off-beat ──────────────────────────────────────────
for (let b = 0; b * BEAT < DURATION; b++) {
  const start = b * BEAT + BEAT / 2;
  const g = clamp01(automation.stab(start));
  if (g <= 0.02) continue;
  if (b % 2 === 1) continue; // every other off-beat — leaves space
  const { pad } = chordAt(start);
  const i0 = Math.floor(start * RATE);
  const len = Math.floor(RATE * 0.2);
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const env = Math.exp(-u * 15) * (1 - Math.exp(-u * 500));
    let v = 0;
    pad.forEach((f) => {
      v += Math.sin(2 * Math.PI * f * 2 * (j / RATE));
    });
    const s = (v / pad.length) * env * g * 0.16;
    add(i0 + j, s * 0.85, s * 1.15);
  }
}

// ── Arp: sixteenth-note motif in the high register ────────────────────────
const ARP_PATTERN = [0, 1, 2, 1, 0, 2, 1, 2];
for (let s16 = 0; s16 * SIXTEENTH < DURATION; s16++) {
  const start = s16 * SIXTEENTH;
  const g = clamp01(automation.arp(start));
  if (g <= 0.02) continue;
  if (s16 % 8 === 3 || s16 % 8 === 7) continue; // gaps keep it a motif
  const { hi } = chordAt(start);
  const f = hi[ARP_PATTERN[s16 % ARP_PATTERN.length] % hi.length];
  const i0 = Math.floor(start * RATE);
  const len = Math.floor(RATE * 0.3);
  const pan = s16 % 4 < 2 ? 0.3 : 0.7;
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const env = Math.exp(-u * 11) * (1 - Math.exp(-u * 700));
    const s =
      (Math.sin(2 * Math.PI * f * (j / RATE)) +
        0.2 * Math.sin(2 * Math.PI * f * 2 * (j / RATE))) *
      env *
      g *
      0.09;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2);
  }
}

// ── Risers into the two biggest turns ─────────────────────────────────────
// A rising filtered-noise sweep pulls the ear across a cut; one into the
// clipping modes, one into the closing card.
for (const at of [28, 58]) {
  const len = Math.floor(RATE * 1.5);
  const i0 = Math.floor((at - 1.5) * RATE);
  let hp = 0;
  let last = 0;
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const n = rand();
    // Sweeping the high-pass upward is what makes it climb.
    const a = 0.72 + 0.26 * u;
    hp = a * (hp + n - last);
    last = n;
    const s = hp * Math.pow(u, 2.2) * 0.16;
    add(i0 + j, s, s);
  }
}

// ── Impacts on the two biggest turns ──────────────────────────────────────
for (const at of [28, 58]) {
  const i0 = Math.floor(at * RATE);
  const len = Math.floor(RATE * 1.1);
  for (let j = 0; j < len; j++) {
    const u = j / len;
    const env = Math.exp(-u * 5.5) * (1 - Math.exp(-u * 600));
    const f = 78 - 40 * Math.min(1, u * 3);
    const s = Math.sin(2 * Math.PI * f * (j / RATE)) * env * 0.55;
    add(i0 + j, s, s);
  }
}

// ── Master ────────────────────────────────────────────────────────────────
const fadeIn = 0.5;
const fadeOut = 1.6;
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const env =
    ease(ramp(t, 0, fadeIn)) * (1 - ease(ramp(t, DURATION - fadeOut, DURATION)));
  // Soft saturation instead of hard clipping: peaks round over, not crack.
  left[i] = Math.tanh(left[i] * env * 1.25);
  right[i] = Math.tanh(right[i] * env * 1.25);
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}

// Normalise to −3 dBFS. Mix level is set by `musicVolume` in audio.json.
const norm = peak > 0 ? 0.707 / peak : 1;

// ── WAV (16-bit PCM stereo) ───────────────────────────────────────────────
const dataBytes = N * 2 * 2;
const buf = Buffer.alloc(44 + dataBytes);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + dataBytes, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); // PCM
buf.writeUInt16LE(2, 22); // channels
buf.writeUInt32LE(RATE, 24);
buf.writeUInt32LE(RATE * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
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
