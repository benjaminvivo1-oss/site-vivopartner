import React from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { tween } from '../anim';
import { AUDIO, sec, TIMELINES, type CutKey } from '../config';
import { dialogueAbs, dialogueSrc } from './dialogue';
import { sfxCues } from './sfx';
import { voLines } from './voiceover';

const tracks = (cut: CutKey) => {
  const tl = TIMELINES[cut];
  return { VO_LINES: voLines(tl), DIALOGUE_ABS: dialogueAbs(tl), SFX_CUES: sfxCues(tl) };
};

/** Présence d'une voix (voix off ou dialogue) à l'image f : 0 → 1, rampes de 6 images */
const voiceAt = ({ VO_LINES, DIALOGUE_ABS }: ReturnType<typeof tracks>, f: number) => {
  let v = 0;
  for (const [from, len] of [
    ...VO_LINES.map((l) => [l.from, l.duration]),
    ...DIALOGUE_ABS.map((l) => [l.from, l.frames]),
  ]) {
    const a = from - 6;
    const b = from + len + 6;
    if (f < a || f > b) continue;
    v = Math.max(v, Math.min(tween(f, [a, from], [0, 1]), tween(f, [from + len, b], [1, 0])));
  }
  return v;
};

/** Atténuation de la musique sous la voix off (rampes de 6 images) */
const duckAt = ({ VO_LINES, DIALOGUE_ABS }: ReturnType<typeof tracks>, f: number) => {
  let d = 0;
  for (const l of VO_LINES) {
    const a = l.from - 6;
    const b = l.from + l.duration + 6;
    if (f < a || f > b) continue;
    d = Math.max(d, Math.min(tween(f, [a, l.from], [0, 1]), tween(f, [l.from + l.duration, b], [1, 0])));
  }
  let g = 1 - d * (1 - AUDIO.musicDuck);
  // dialogue du pilier 2 : musique plus basse encore
  for (const l of DIALOGUE_ABS) {
    const a = l.from - 8;
    const b = l.from + l.frames + 8;
    if (f < a || f > b) continue;
    const k = Math.min(tween(f, [a, l.from], [0, 1]), tween(f, [l.from + l.frames, b], [1, 0]));
    g = Math.min(g, 1 - k * (1 - AUDIO.musicDuckDialogue));
  }
  return g;
};

/** Musique (atténuée sous la voix), voix off phrase par phrase et bruitages. */
export const Soundtrack: React.FC<{ cut?: CutKey }> = ({ cut = 'full' }) => {
  const { durationInFrames } = useVideoConfig();
  const t = tracks(cut);
  const { VO_LINES, DIALOGUE_ABS, SFX_CUES } = t;
  const music = cut === 'short' ? AUDIO.musicShort : AUDIO.music;

  const musicVolume = (f: number) =>
    AUDIO.musicVolume *
    duckAt(t, f) *
    Math.min(
      tween(f, [0, sec(AUDIO.musicFadeInSeconds)], [0, 1]),
      tween(f, [durationInFrames - sec(AUDIO.musicFadeOutSeconds), durationInFrames], [1, 0]),
    );

  return (
    <>
      {music && <Audio src={staticFile(music)} volume={musicVolume} />}

      {AUDIO.voiceover &&
        VO_LINES.map((l) => (
          <Sequence key={l.id} name={`Voix off · ${l.text}`} from={l.from} durationInFrames={l.duration}>
            <Audio src={staticFile(`audio/vo/${l.id}.mp3`)} volume={AUDIO.voiceoverVolume} />
          </Sequence>
        ))}

      {DIALOGUE_ABS.map((l) => (
        <Sequence key={l.id} name={`Dialogue · ${l.speaker}`} from={l.from} durationInFrames={l.frames}>
          <Audio src={staticFile(dialogueSrc(l.id))} volume={AUDIO.dialogueVolume} />
        </Sequence>
      ))}

      {AUDIO.sfx &&
        SFX_CUES.map((c, i) => (
          <Sequence key={i} name={`Bruitage · ${c.sfx}`} from={c.frame} durationInFrames={sec(2)}>
            <Audio
              src={staticFile(`audio/sfx/${c.sfx}.mp3`)}
              volume={(f) => AUDIO.sfxVolume * (c.volume ?? 1) * (1 - voiceAt(t, c.frame + f) * (1 - AUDIO.sfxDuck))}
              playbackRate={c.rate ?? 1}
            />
          </Sequence>
        ))}
    </>
  );
};
