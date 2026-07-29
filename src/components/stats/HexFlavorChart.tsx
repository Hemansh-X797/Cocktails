'use client';

import { useEffect, useRef, useState, useId } from 'react';

/**
 * A radar/"stats card" chart for a cocktail's flavorProfile. Renders as a
 * true regular polygon (hexagon at 6 axes, pentagon at 5, etc — whatever
 * the data provides) with concentric grid rings, axis labels, a filled
 * champagne/ruby gradient blob for the values, and per-axis value nodes.
 *
 * The shape draws itself in on scroll-into-view (stroke-dasharray reveal +
 * scale-from-center), and the value blob subtly breathes and tilts toward
 * the cursor for a "held up to the light" feel — same velvet easing used
 * across the rest of the site.
 */
export function HexFlavorChart({
  profile,
  size = 340,
  accent = '#e5c158',
}: {
  profile: Record<string, number>;
  size?: number;
  accent?: string;
}) {
  const entries = Object.entries(profile);
  const axisCount = entries.length;
  const uid = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.47;
  const rings = [0.25, 0.5, 0.75, 1];

  // Angle for axis i, starting at top (-90deg) going clockwise.
  const angleFor = (i: number) => (Math.PI * 2 * i) / axisCount - Math.PI / 2;

  const pointAt = (i: number, r: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };

  const ringPath = (fraction: number) =>
    entries
      .map((_, i) => pointAt(i, maxR * fraction).join(','))
      .join(' ');

  const valuePath = entries
    .map(([, value], i) => pointAt(i, (Math.max(0, Math.min(100, value)) / 100) * maxR).join(','))
    .join(' ');

  const perimeter = axisCount * maxR * 2.2; // rough upper bound for dash reveal

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto select-none"
      style={{ width: size, height: size }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: px * 10, y: py * -10 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible transition-transform duration-700 ease-velvet"
        style={{
          transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        <defs>
          <radialGradient id={`grad-${uid}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="70%" stopColor="#8b0000" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b0000" stopOpacity="0.08" />
          </radialGradient>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric grid rings */}
        {rings.map((f) => (
          <polygon
            key={f}
            points={ringPath(f)}
            fill="none"
            stroke="rgba(236,231,221,0.12)"
            strokeWidth={1}
          />
        ))}

        {/* Axis spokes */}
        {entries.map((_, i) => {
          const [x, y] = pointAt(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(236,231,221,0.1)"
              strokeWidth={1}
            />
          );
        })}

        {/* Value shape — draws in on scroll */}
        <polygon
          points={valuePath}
          fill={`url(#grad-${uid})`}
          stroke={accent}
          strokeWidth={1.5}
          filter={`url(#glow-${uid})`}
          style={{
            strokeDasharray: perimeter,
            strokeDashoffset: visible ? 0 : perimeter,
            opacity: visible ? 1 : 0,
            transformOrigin: `${cx}px ${cy}px`,
            transform: visible ? 'scale(1)' : 'scale(0.7)',
            transition:
              'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* Value nodes */}
        {entries.map(([key, value], i) => {
          const [x, y] = pointAt(i, (Math.max(0, Math.min(100, value)) / 100) * maxR);
          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r={visible ? 3.5 : 0}
              fill={accent}
              style={{ transition: `r 0.5s ease ${0.6 + i * 0.06}s` }}
            />
          );
        })}
      </svg>

      {/* Axis labels, positioned outside the polygon */}
      {entries.map(([key, value], i) => {
        const [x, y] = pointAt(i, labelR);
        const align = Math.cos(angleFor(i)) > 0.3 ? 'left' : Math.cos(angleFor(i)) < -0.3 ? 'right' : 'center';
        return (
          <div
            key={key}
            className="absolute font-mono text-[10px] uppercase tracking-widest text-bone/50 transition-colors duration-500"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              textAlign: align as any,
              opacity: visible ? 1 : 0,
              transitionDelay: `${0.3 + i * 0.05}s`,
            }}
          >
            {key}
            <span className="block text-champagne/80">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
