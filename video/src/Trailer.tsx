import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT, tween } from './anim';
import { AUDIO, COLORS, CROSSFADE_FRAMES, sec, TIMELINE } from './config';
import { SCENES } from './scenes';

/** Fondu d'entrée (opacité + léger zoom arrière) appliqué aux scènes 'fade' */
const SceneEnter: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
  const frame = useCurrentFrame();
  if (!enabled) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = tween(frame, [0, CROSSFADE_FRAMES], [0, 1], EASE_OUT);
  return <AbsoluteFill style={{ opacity: p, transform: `scale(${1.03 - 0.03 * p})` }}>{children}</AbsoluteFill>;
};

/** Composition principale : enchaîne les 8 scènes + pistes audio optionnelles */
export const Trailer: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const last = TIMELINE.items.length - 1;

  const musicVolume = (f: number) =>
    AUDIO.musicVolume *
    Math.min(
      tween(f, [0, sec(AUDIO.musicFadeInSeconds)], [0, 1]),
      tween(f, [durationInFrames - sec(AUDIO.musicFadeOutSeconds), durationInFrames], [1, 0]),
    );

  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      {TIMELINE.items.map(({ key, from, duration }, i) => {
        const { component: Scene, title, enter } = SCENES[key];
        // la scène reste affichée pendant le fondu de la suivante
        const len = i < last ? duration + CROSSFADE_FRAMES : duration;
        return (
          <Sequence key={key} name={title} from={from} durationInFrames={len}>
            <SceneEnter enabled={enter === 'fade'}>
              <Scene />
            </SceneEnter>
          </Sequence>
        );
      })}

      {AUDIO.music && <Audio src={staticFile(AUDIO.music)} volume={musicVolume} />}
      {AUDIO.voiceover && (
        <Sequence from={sec(AUDIO.voiceoverOffset)} name="Voix off">
          <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceoverVolume} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
