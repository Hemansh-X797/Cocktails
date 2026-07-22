'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuthSession();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(password);
    setSubmitting(false);
    if (result.ok) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Invalid key.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-8">
      <div className="w-full max-w-sm">
        <span className="section-eyebrow">Private Access</span>
        <h1 className="font-display text-4xl text-bone mt-3 mb-10">Enter your key</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="w-full border-b border-champagne/30 bg-transparent py-3 text-bone placeholder:text-bone/20 outline-none focus:border-champagne transition-colors"
          />

          {error && <p className="text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            data-cursor-hover
            className="w-full border border-champagne/40 py-3 font-mono text-xs uppercase tracking-widest2 text-champagne transition-colors hover:bg-champagne hover:text-void disabled:opacity-40"
          >
            {submitting ? 'Verifying…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  );
}
