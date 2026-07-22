/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#050505',
        obsidian: '#121212',
        ruby: '#8b0000',
        crimson: '#ff1a1a',
        champagne: '#e5c158',
        bone: '#ece7dd',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      transitionTimingFunction: {
        velvet: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        'ruby-radial': 'radial-gradient(circle at 50% 0%, rgba(139,0,0,0.25), transparent 60%)',
        'gold-hairline': 'linear-gradient(90deg, transparent, #e5c158, transparent)',
      },
    },
  },
  plugins: [],
};
