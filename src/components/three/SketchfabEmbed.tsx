'use client';

/**
 * Embeds a real, artist-made Sketchfab model instead of a procedural
 * Three.js mesh. Sized to fill its parent and cropped to hide Sketchfab's
 * own UI chrome as much as their embed API allows (ui_theme=dark,
 * ui_infos=0, ui_controls=0, ui_watermark=0) — attribution is still
 * shown beneath, per Sketchfab's license terms.
 */
export function SketchfabEmbed({
  modelId,
  title,
  author,
  authorUrl,
  modelUrl,
  className = '',
}: {
  modelId: string;
  title: string;
  author: string;
  authorUrl: string;
  modelUrl: string;
  className?: string;
}) {
  const src = `https://sketchfab.com/models/${modelId}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_controls=1&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&transparent=1`;

  return (
    <div className={`relative ${className}`}>
      <iframe
        title={title}
        src={src}
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        className="h-full w-full"
        style={{ background: 'transparent' }}
      />
      <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-bone/20">
        <a href={modelUrl} target="_blank" rel="nofollow noopener" className="pointer-events-auto hover:text-champagne/50 transition-colors">
          {title}
        </a>
        {' '}by{' '}
        <a href={authorUrl} target="_blank" rel="nofollow noopener" className="pointer-events-auto hover:text-champagne/50 transition-colors">
          {author}
        </a>
      </p>
    </div>
  );
}
