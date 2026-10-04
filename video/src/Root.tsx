import React from 'react';
import { Composition, Folder } from 'remotion';
import { FORMATS, FPS, TIMELINE, TIMELINES, TOTAL_FRAMES } from './config';
import { loadFonts } from './fonts';
import { SCENES } from './scenes';
import { Trailer } from './Trailer';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    {/* Version courte (pub Reels / TikTok / Shorts) : hook, réceptionniste IA, bénéfices, CTA */}
    <Composition
      id="Short-9x16"
      component={Trailer}
      defaultProps={{ cut: 'short' as const }}
      durationInFrames={TIMELINES.short.cursor}
      fps={FPS}
      width={FORMATS.vertical.width}
      height={FORMATS.vertical.height}
    />

    {/* Compositions principales : la vidéo complète */}
    {Object.values(FORMATS).map((f) => (
      <Composition
        key={f.id}
        id={`Trailer-${f.id}`}
        component={Trailer}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={f.width}
        height={f.height}
      />
    ))}

    {/* Une composition par scène, dans chaque format */}
    {Object.values(FORMATS).map((f) => (
      <Folder key={f.id} name={`Scenes-${f.id}`}>
        {TIMELINE.items.map(({ key, duration }) => (
          <Composition
            key={key}
            id={`${SCENES[key].title}-${f.id}`}
            component={SCENES[key].component}
            durationInFrames={duration}
            fps={FPS}
            width={f.width}
            height={f.height}
          />
        ))}
      </Folder>
    ))}
  </>
);
