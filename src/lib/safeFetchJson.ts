/**
 * A fetch wrapper that a loading spinner can trust to always resolve.
 *
 * The bug this exists to prevent: `const data = await res.json()` throws
 * if the response isn't clean JSON (a proxy error page, a dropped
 * connection, a timeout) — and if that throw isn't caught, whatever
 * `setSaving(false)` was supposed to run right after it never runs. The
 * UI is left showing "Saving…" forever with no way out but a refresh.
 *
 * This wraps the whole request/parse/timeout sequence in one place so
 * every call site gets a plain `{ ok, data, error }` result — there is
 * no code path left that can throw past the caller.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(timeout);

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // Response wasn't JSON (blank body, HTML error page, etc). Don't
      // let that become an uncaught throw — turn it into a normal
      // failure result the caller can display and recover from.
      return {
        ok: false,
        status: res.status,
        error: res.ok
          ? 'The server responded, but not with the data expected. Please try again.'
          : `Request failed (${res.status}).`,
      };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, error: data?.error || `Request failed (${res.status}).` };
    }
    return { ok: true, status: res.status, data: data as T };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, status: 0, error: 'Timed out. Check your connection and try again.' };
    }
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : 'Network error. Please try again.',
    };
  }
}
