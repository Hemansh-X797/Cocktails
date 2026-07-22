'use client';

import { useEffect, useRef, useState } from 'react';

export function AmbientAudio({ src = '/audio/ambient-lounge.mp3' }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.35;
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {
        /* Autoplay can be blocked; user gesture from this click satisfies most browser policies. */
      });
      setPlaying(true);
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        onClick={toggle}
        data-cursor-hover
        aria-pressed={playing}
        aria-label={playing ? 'Mute ambient sound' : 'Play ambient sound'}
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-champagne/30 bg-obsidian/80 backdrop-blur transition-colors duration-300 hover:border-champagne"
      >
        <span className="flex gap-[3px] items-end h-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[2px] bg-champagne rounded-full"
              style={{
                height: playing ? undefined : '4px',
                animation: playing ? `soundbar 0.9s ease-in-out ${i * 0.15}s infinite` : 'none',
              }}
            />
          ))}
        </span>
      </button>
      <style jsx global>{`
        @keyframes soundbar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
    </>
  );
}
