import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";

import audioConfig from "../audio.json";
import voiceover from "../voiceover.json";

/**
 * Narration and music bed.
 *
 * Each ElevenLabs line is mounted as its own <Audio> at the frame derived from
 * its `startSeconds`, rather than being stitched into one long track. That
 * removes the need for a system ffmpeg, keeps the script human-editable, and
 * makes drift structurally impossible — moving a line in `voiceover.json`
 * moves it in the render.
 *
 * Until `npm run voiceover` has run, `generated` is false and nothing is
 * mounted, so the composition still renders (silently) rather than failing on
 * a missing file.
 */
export const Narration: React.FC = () => {
  const { fps } = useVideoConfig();
  const { music, musicVolume, voiceoverVolume } = audioConfig as {
    music: string | null;
    musicVolume: number;
    voiceoverVolume: number;
  };

  return (
    <>
      {music ? (
        <Audio src={staticFile(music)} volume={musicVolume} loop />
      ) : null}

      {voiceover.generated
        ? voiceover.lines.map((line) => (
            <Sequence
              key={line.id}
              name={`vo-${line.id}`}
              from={Math.round(line.startSeconds * fps)}
            >
              <Audio
                src={staticFile(`vo/${line.id}.mp3`)}
                volume={voiceoverVolume}
              />
            </Sequence>
          ))
        : null}
    </>
  );
};
