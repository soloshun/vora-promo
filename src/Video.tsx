import React from "react";
import { Sequence } from "remotion";

import { Narration } from "./components/Narration";
import { scenes } from "./theme";
import { ClipModes } from "./scenes/ClipModes";
import { ColdOpen } from "./scenes/ColdOpen";
import { Cta } from "./scenes/Cta";
import { Edit } from "./scenes/Edit";
import { Problem } from "./scenes/Problem";
import { Proof } from "./scenes/Proof";
import { Publish } from "./scenes/Publish";
import { Record } from "./scenes/Record";
import { Understand } from "./scenes/Understand";

/**
 * Frames each scene may run past its slot so the outgoing shot can dissolve
 * over the incoming one. Scenes are stacked in reverse order below, which puts
 * the outgoing scene on top of its successor while it fades.
 */
const OVERLAP = 18;

const TIMELINE = [
  { key: "coldOpen", slot: scenes.coldOpen, Component: ColdOpen, overlap: 0 },
  { key: "problem", slot: scenes.problem, Component: Problem, overlap: OVERLAP },
  { key: "record", slot: scenes.record, Component: Record, overlap: OVERLAP },
  {
    key: "understand",
    slot: scenes.understand,
    Component: Understand,
    overlap: OVERLAP,
  },
  {
    key: "clipModes",
    slot: scenes.clipModes,
    Component: ClipModes,
    overlap: OVERLAP,
  },
  { key: "edit", slot: scenes.edit, Component: Edit, overlap: OVERLAP },
  { key: "publish", slot: scenes.publish, Component: Publish, overlap: OVERLAP },
  { key: "proof", slot: scenes.proof, Component: Proof, overlap: OVERLAP },
  { key: "cta", slot: scenes.cta, Component: Cta, overlap: 0 },
] as const;

/** The Vora product film. */
export const VoraPromo: React.FC = () => (
  <>
    <Narration />

    {/*
      Reverse order: later scenes render underneath, so a scene fading out at
      the end of its slot dissolves to reveal the one already playing below.
    */}
    {[...TIMELINE].reverse().map(({ key, slot, Component, overlap }) => (
      <Sequence
        key={key}
        name={key}
        from={slot.start}
        durationInFrames={slot.duration + overlap}
      >
        <Component />
      </Sequence>
    ))}
  </>
);
