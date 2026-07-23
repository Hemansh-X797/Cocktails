'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Wraps next/image with a graceful fallback for the very real situation
 * of "the JSON has an image path but no file/URL exists yet." Renders a
 * tasteful gradient placeholder instead of a broken image icon — once you
 * add a real photo via the dashboard or public/images, it just works.
 */
export function SafeImage({
  src,
  alt,
  fill,
  className,
  sizes,
  fallbackFrom = '#1a1a1a',
  fallbackTo = '#050505',
  draggable,
}: {
  src?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  fallbackFrom?: string;
  fallbackTo?: string;
  draggable?: boolean;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center ${className || ''}`}
        style={{
          background: `linear-gradient(160deg, ${fallbackFrom}, ${fallbackTo})`,
          position: fill ? 'absolute' : 'relative',
          inset: fill ? 0 : undefined,
        }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone/20">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      draggable={draggable}
      onError={() => setErrored(true)}
      unoptimized={src.startsWith('http')}
    />
  );
}
