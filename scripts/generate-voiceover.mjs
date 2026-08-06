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
 *   npm run voiceover -- --check      # re-check timing, no API calls
 */

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseBuffer } from "music-metadata";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT_PATH = path.join(ROOT, "src", "voiceover.json");
const OUT_DIR = path.join(ROOT, "public", "vo");
const API = "https://api.elevenlabs.io/v1";

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

/** Synthesises one line and returns the mp3 bytes. */
async function synthesise(script, line) {
  const res = await fetch(
    `${API}/text-to-speech/${script.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: line.text,
        model_id: script.modelId,
        voice_settings: script.voiceSettings,
      }),
    },
  );

  if (!res.ok) {
    fail(
      `Line ${line.id} failed — ElevenLabs returned ${res.status}:\n  ${await res.text()}`,
    );
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

  for (const line of script.lines) {
    const file = path.join(OUT_DIR, `${line.id}.mp3`);
    if (existsSync(file) && !flag("force")) {
      const { size } = await stat(file);
      console.log(
        `  ${colour.dim("·")} ${line.id}  ${colour.dim(
          `cached (${(size / 1024).toFixed(0)} kB) — pass --force to regenerate`,
        )}`,
      );
      continue;
    }
    const audio = await synthesise(script, line);
    await writeFile(file, audio);
    console.log(
      `  ${colour.green("✓")} ${line.id}  ${colour.dim(
        `${(audio.length / 1024).toFixed(0)} kB`,
      )}  ${line.text.slice(0, 58)}${line.text.length > 58 ? "…" : ""}`,
    );
  }

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
