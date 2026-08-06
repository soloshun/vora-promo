#!/usr/bin/env node
/**
 * Generates the Vora narration with ElevenLabs.
 *
 * One request per line in `src/voiceover.json`, written to `public/vo/<id>.mp3`.
 * Lines are deliberately NOT stitched into a single track: the composition
 * mounts each file at its own `startSeconds`, so timing stays editable and
 * needs no ffmpeg.
 *
 * After a successful run the script flips `generated` to true and reports any
 * line whose spoken duration overruns the start of the next one, which is the
 * only way this setup can go wrong.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_... npm run voiceover
 *   ELEVENLABS_API_KEY=sk_... npm run voiceover -- --voice <voiceId>
 *   npm run voiceover -- --voices     # list voices on the account
 *   npm run voiceover -- --quota      # character balance vs. what a rerun costs
 *   npm run voiceover -- --check      # re-check timing, no API calls
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseBuffer } from "music-metadata";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT_PATH = path.join(ROOT, "src", "voiceover.json");
const OUT_DIR = path.join(ROOT, "public", "vo");
/** Maps line id → hash of the text and voice settings that produced its mp3. */
const CACHE_PATH = path.join(OUT_DIR, ".cache.json");
const API = "https://api.elevenlabs.io/v1";

/**
 * Minimal .env loader, so `npm run voiceover` works without exporting the key
 * into the shell first. Existing environment variables always win.
 */
const loadDotEnv = () => {
  const file = path.join(ROOT, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
};
loadDotEnv();

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const option = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};

const colour = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const fail = (message) => {
  console.error(`\n${colour.red("✗")} ${message}\n`);
  process.exit(1);
};

const apiKey = process.env.ELEVENLABS_API_KEY;

/**
 * Fingerprints everything that affects the audio. When a line's text or the
 * voice settings change, its hash changes and it regenerates on the next run —
 * so editing the script never silently leaves a stale take on disk.
 */
const fingerprint = (script, line) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        line.text,
        script.voiceId,
        script.modelId,
        script.voiceSettings,
      ]),
    )
    .digest("hex")
    .slice(0, 16);

const readCache = () => {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
};

/** Reports the character balance, to separate quota problems from plan ones. */
async function reportQuota() {
  if (!apiKey) fail("ELEVENLABS_API_KEY is not set.");
  const res = await fetch(`${API}/user/subscription`, {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) fail(`ElevenLabs returned ${res.status}: ${await res.text()}`);
  const d = await res.json();
  const left = d.character_limit - d.character_count;
  const needed = JSON.parse(readFileSync(SCRIPT_PATH, "utf8")).lines.reduce(
    (n, l) => n + l.text.length,
    0,
  );
  console.log(
    `\n${colour.bold("ElevenLabs quota")}\n\n` +
      `  plan          ${d.tier}\n` +
      `  characters    ${d.character_count} / ${d.character_limit} used\n` +
      `  remaining     ${colour.green(String(left))}\n` +
      `  this script   ${needed} characters for a full regeneration\n\n` +
      `  ${left >= needed ? colour.green("✓ enough for a full regeneration") : colour.red("✗ not enough for a full regeneration")}\n`,
  );
}

/** Lists the voices available on the account, so a voice ID can be chosen. */
async function listVoices() {
  if (!apiKey) fail("ELEVENLABS_API_KEY is not set.");
  const res = await fetch(`${API}/voices`, {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) fail(`ElevenLabs returned ${res.status}: ${await res.text()}`);
  const { voices } = await res.json();
  console.log(`\n${colour.bold("Available voices")}\n`);
  for (const v of voices) {
    const labels = Object.values(v.labels ?? {}).join(", ");
    console.log(
      `  ${colour.green(v.voice_id)}  ${v.name.padEnd(18)} ${colour.dim(labels)}`,
    );
  }
  console.log(
    `\n${colour.dim("Set one with:")} npm run voiceover -- --voice <voiceId>\n`,
  );
}

/**
 * Synthesises one line and returns the mp3 bytes.
 *
 * `speed` is only honoured by some models. Rather than pin the script to a
 * model list that will age, the first attempt sends it and a rejection retries
 * without it — the take is then just marginally slower, not missing.
 */
async function synthesise(script, line, settings = script.voiceSettings) {
  const res = await fetch(
    `${API}/text-to-speech/${script.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: line.text,
        model_id: script.modelId,
        voice_settings: settings,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();

    // A library voice on a free plan fails here, and the raw 402 reads like a
    // billing problem when it is actually a plan-tier restriction — the
    // character balance is untouched. Say so plainly.
    if (res.status === 402 && body.includes("paid_plan_required")) {
      fail(
        `Voice ${script.voiceId} is a Voice Library voice, and this account's ` +
          `plan cannot use library voices through the API.\n` +
          `  This is NOT a credit problem — run with --quota to see the balance.\n` +
          `  Either upgrade the ElevenLabs plan, or pick one of the voices already\n` +
          `  on the account: npm run voiceover -- --voices`,
      );
    }

    if (res.status === 422 && "speed" in settings) {
      const { speed, ...rest } = settings;
      console.log(
        `  ${colour.yellow("!")} ${line.id}  ${colour.dim(
          `model rejected speed=${speed}; retrying at normal rate`,
        )}`,
      );
      return synthesise(script, line, rest);
    }
    fail(`Line ${line.id} failed — ElevenLabs returned ${res.status}:\n  ${body}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Reports where narration would collide. A line may run into the gap after it,
 * but not past the moment the next line is scheduled to start.
 */
async function checkTiming(script) {
  console.log(`\n${colour.bold("Timing check")}\n`);
  let problems = 0;
  let generated = 0;

  for (const [i, line] of script.lines.entries()) {
    const file = path.join(OUT_DIR, `${line.id}.mp3`);
    if (!existsSync(file)) {
      console.log(
        `  ${colour.yellow("–")} ${line.id}  ${colour.dim("not generated yet")}`,
      );
      continue;
    }
    generated++;
    const { format } = await parseBuffer(await readFile(file), "audio/mpeg");
    const duration = format.duration ?? 0;
    const ends = line.startSeconds + duration;
    const next = script.lines[i + 1];
    const budget = next ? next.startSeconds - line.startSeconds : Infinity;
    const overrun = duration - budget;

    const window = `${line.startSeconds.toFixed(1)}s → ${ends.toFixed(1)}s`;
    if (overrun > 0.05) {
      problems++;
      console.log(
        `  ${colour.red("!")} ${line.id}  ${window}  ${colour.red(
          `overruns line ${next.id} by ${overrun.toFixed(2)}s`,
        )}`,
      );
    } else {
      console.log(
        `  ${colour.green("✓")} ${line.id}  ${window}  ${colour.dim(
          `${duration.toFixed(2)}s spoken, ${
            budget === Infinity ? "—" : `${budget.toFixed(1)}s budget`
          }`,
        )}`,
      );
    }
  }

  if (problems > 0) {
    console.log(
      `\n${colour.yellow("→")} ${problems} line(s) run long. Shorten the text, or push the ` +
        `following line's ${colour.bold("startSeconds")} back in src/voiceover.json.\n` +
        `  Scene boundaries live in src/theme.ts — keep narration inside its own scene.\n`,
    );
  } else if (generated === 0) {
    console.log(
      `\n${colour.yellow("→")} Nothing generated yet — nothing to check.\n` +
        `  Run: ${colour.bold("ELEVENLABS_API_KEY=sk_... npm run voiceover")}\n`,
    );
  } else {
    console.log(
      `\n${colour.green("✓")} All ${generated} generated line(s) fit their slots.\n`,
    );
  }
  return problems;
}

async function main() {
  const script = JSON.parse(await readFile(SCRIPT_PATH, "utf8"));

  if (flag("quota")) return reportQuota();
  if (flag("voices")) return listVoices();
  if (flag("check")) return void (await checkTiming(script));

  if (!apiKey) {
    fail(
      "ELEVENLABS_API_KEY is not set.\n" +
        "  Get a key at https://elevenlabs.io/app/settings/api-keys, then:\n" +
        "    ELEVENLABS_API_KEY=sk_... npm run voiceover",
    );
  }

  const voiceOverride = option("voice");
  if (voiceOverride) script.voiceId = voiceOverride;

  await mkdir(OUT_DIR, { recursive: true });

  console.log(
    `\n${colour.bold("Generating narration")} ${colour.dim(
      `· ${script.lines.length} lines · voice ${script.voiceId} · ${script.modelId}`,
    )}\n`,
  );

  const cache = readCache();
  const seen = new Set();
  let generated = 0;

  for (const line of script.lines) {
    const file = path.join(OUT_DIR, `${line.id}.mp3`);
    const hash = fingerprint(script, line);
    seen.add(line.id);

    if (existsSync(file) && cache[line.id] === hash && !flag("force")) {
      console.log(`  ${colour.dim("·")} ${line.id}  ${colour.dim("unchanged")}`);
      continue;
    }

    const audio = await synthesise(script, line);
    await writeFile(file, audio);
    cache[line.id] = hash;
    generated++;
    console.log(
      `  ${colour.green("✓")} ${line.id}  ${colour.dim(
        `${(audio.length / 1024).toFixed(0)} kB`,
      )}  ${line.text.slice(0, 58)}${line.text.length > 58 ? "…" : ""}`,
    );
  }

  // Drop cache entries for lines that no longer exist in the script.
  for (const id of Object.keys(cache)) if (!seen.has(id)) delete cache[id];
  await writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(
    `\n  ${generated} regenerated, ${script.lines.length - generated} reused.`,
  );

  script.generated = true;
  await writeFile(SCRIPT_PATH, `${JSON.stringify(script, null, 2)}\n`);

  await checkTiming(script);
  console.log(
    `${colour.green("✓")} Narration written to public/vo/ and enabled in the composition.\n` +
      `  Preview:  ${colour.bold("npm start")}\n` +
      `  Render:   ${colour.bold("npm run build")}\n`,
  );
}

main().catch((error) => fail(error.stack ?? String(error)));
