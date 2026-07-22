import Link from 'next/link';
import { HeroFrameScrubber } from '@/components/hero/HeroFrameScrubber';

export function HeroSection() {
  return (
    <>
      <header className="fixed top-0 z-40 flex w-full items-center justify-between px-8 py-6 mix-blend-difference">
        <Link href="/" data-cursor-hover className="font-display text-lg tracking-widest2 text-bone">
          MCG
        </Link>
        <nav className="hidden gap-8 font-mono text-xs uppercase tracking-widest2 text-bone md:flex">
          <Link href="/cocktails" data-cursor-hover className="hover:text-champagne transition-colors">
            Cocktails
          </Link>
          <Link href="/spirits" data-cursor-hover className="hover:text-champagne transition-colors">
            Spirits
          </Link>
          <Link href="/tools" data-cursor-hover className="hover:text-champagne transition-colors">
            Tools
          </Link>
          <Link href="/login" data-cursor-hover className="hover:text-champagne transition-colors">
            Access
          </Link>
        </nav>
        <span className="font-mono text-[10px] text-bone/50">⌘K to search</span>
      </header>
      <HeroFrameScrubber />
    </>
  );
}
