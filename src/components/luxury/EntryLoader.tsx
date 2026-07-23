'use client';

import { useEffect, useState } from 'react';

const WORDS = ['Decanting', 'Aerating', 'Breathing', 'Ready'];
const SESSION_KEY = 'mcg-entered';

/**
 * A brief, branded gate shown once per browser session (not on every
 * route change — checked via sessionStorage) before the site reveals
 * itself. Rather than a generic spinner, it's a wine glass filling —
 * on brand, and it gives real work (image/font preloading, layout
 * settling) somewhere to hide instead of happening visibly on the page.
 */
export function EntryLoader() {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }

    const wordTimer = setInterval(() => {
      setWordIndex((w) => (w + 1) % WORDS.length);
    }, 620);

    const pctTimer = setInterval(() => {
      setPct((p) => {
        const next = Math.min(100, p + Math.random() * 13 + 5);
        if (next >= 100) {
          clearInterval(pctTimer);
          clearInterval(wordTimer);
          sessionStorage.setItem(SESSION_KEY, '1');
          setTimeout(() => setDone(true), 240);
          setTimeout(() => setVisible(false), 1350);
        }
        return next;
      });
    }, 200);

    return () => {
      clearInterval(wordTimer);
      clearInterval(pctTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-void transition-all duration-[1100ms] ease-velvet ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, #140406 0%, #050505 70%)',
      }}
    >
      <div className={`transition-transform duration-[1100ms] ease-velvet ${done ? '-translate-y-3' : ''}`}>
        <svg viewBox="0 0 64 96" className="mx-auto mb-8 h-24 w-16">
          <path
            fill="none"
            stroke="#c9a15a"
            strokeWidth="1.1"
            opacity="0.85"
            d="M14 6 L50 6 L50 24 C50 40 38 46 32 48 C26 46 14 40 14 24 Z"
          />
          <path
            fill="#b3122b"
            d="M17 9 L47 9 L47 24 C47 38 36 43.5 32 45 C28 43.5 17 38 17 24 Z"
            style={{
              clipPath: `inset(${Math.max(0, 100 - pct * 1.4)}% 0 0 0)`,
              transition: 'clip-path 0.25s linear',
            }}
          />
          <line stroke="#c9a15a" strokeWidth="1.1" opacity="0.85" x1="32" y1="48" x2="32" y2="82" />
          <ellipse
            fill="none"
            stroke="#c9a15a"
            strokeWidth="1.1"
            opacity="0.85"
            cx="32"
            cy="88"
            rx="16"
            ry="4"
          />
        </svg>
      </div>

      <div className="h-4 overflow-hidden font-mono text-[11px] uppercase tracking-[0.35em] text-champagne/75">
        <span key={wordIndex} className="inline-block animate-[fadeSlide_0.62s_ease]">
          {WORDS[wordIndex]}
        </span>
      </div>

      <div className="relative mt-6 h-px w-44 overflow-hidden bg-gradient-to-r from-transparent via-champagne/50 to-transparent">
        <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[sweep_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-r from-transparent via-[#e8c98a] to-transparent" />
      </div>

      <div className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 font-mono text-[11px] tabular-nums text-bone/25">
        {String(Math.floor(pct)).padStart(2, '0')}%
      </div>

      <style jsx global>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes sweep {
          from {
            left: -50%;
          }
          to {
            left: 140%;
          }
        }
      `}</style>
    </div>
  );
}
