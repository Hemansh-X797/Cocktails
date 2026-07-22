import type { Metadata } from 'next';
import './globals.css';
import { SmoothScrollProvider } from '@/components/luxury/SmoothScrollProvider';
import { BespokeCursor } from '@/components/luxury/BespokeCursor';
import { AmbientAudio } from '@/components/luxury/AmbientAudio';
import { CommandPalette } from '@/components/search/CommandPalette';
import { getSearchIndex } from '@/lib/adapter';

export const metadata: Metadata = {
  title: 'My Cocktail Guide — Haute Mixology',
  description:
    'An avant-garde archive of rare spirits, obsidian cocktails, and precision bartending tools.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getSearchIndex();

  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          <BespokeCursor />
          <CommandPalette index={searchIndex} />
          {children}
          <AmbientAudio />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
