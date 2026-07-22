'use client';

import { useCallback, useEffect, useState } from 'react';

interface SessionInfo {
  authenticated: boolean;
  keyId?: string;
  role?: 'master' | 'mixologist' | 'guest';
  permissions?: string[];
}

/**
 * Client-side view of the server-verified session. The actual password
 * check and JWT signing happen server-side (`/api/auth/login`), stored in
 * an httpOnly cookie the browser can't read or tamper with — this hook
 * just asks the server "am I logged in, and what can I do."
 */
export function useAuthSession() {
  const [session, setSession] = useState<SessionInfo>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data: SessionInfo = await res.json();
      setSession(data);
    } catch {
      setSession({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (password: string): Promise<{ ok: boolean; error?: string }> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: data.error || 'Invalid key.' };
      }
      await refresh();
      return { ok: true };
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession({ authenticated: false });
  }, []);

  const can = useCallback(
    (permission: string) => !!session.permissions?.includes(permission),
    [session]
  );

  return { session, loading, login, logout, can, isAuthenticated: session.authenticated };
}
