# My Cocktail Guide

A private, avant-garde archive of haute mixology — 169-frame scroll-scrubbed hero,
physics cursor, kinetic cards, and a real dashboard for adding drinks/spirits/tools
with your own images or public links.

## Deploying to Vercel

1. **Push this repo to GitHub**, then import it in Vercel (New Project → your repo).

2. **Attach storage** (Storage tab in your Vercel project):
   - **Blob** → Create Database → Blob. This powers image uploads in the dashboard
     (`BLOB_READ_WRITE_TOKEN` is injected automatically).
   - **Redis** → Marketplace → Upstash Redis. This is where dashboard-added drinks,
     spirits, and tools are stored, persisted across deploys
     (`KV_REST_API_URL` / `KV_REST_API_TOKEN` are injected automatically).
   Without these, the app still runs — uploads/adds just won't persist across
   server restarts (a console warning tells you this).

3. **Set one environment variable**: `AUTH_SECRET` — any long random string
   (e.g. `openssl rand -base64 32`). This signs dashboard login sessions.

4. **Deploy.** Vercel auto-detects Next.js; no build command changes needed.

## Logging into the dashboard

Passwords live (hashed, SHA-256) in `src/data/passwords.json`. Out of the box:

| Key          | Role         | Can add drinks/images? | Can delete? |
|--------------|--------------|-------------------------|-------------|
| `sovereign`  | master       | Yes                     | Yes         |
| `mixologist` | mixologist   | Yes                     | No          |
| `guest2026`  | guest        | View only               | No          |

**Change these before sharing the link with friends.** Generate new hashes with:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('yourNewPassword').digest('hex'))"
```

Paste the resulting hash into `src/data/passwords.json`.

## Adding your own frames / photos

- Drop 169 frames into `public/frames/` named `hero_001.webp` … `hero_169.webp`
  (any consistent aspect ratio; the canvas cover-fits automatically).
- For cocktail/spirit/tool photos, either add files under `public/images/...` and
  reference them in the JSON `image` field, or — much easier — just use the
  **dashboard**: log in, go to a tab, and either upload a file or paste a public
  image URL. It's stored for you and shows up on the site immediately.

## Local development

```bash
npm install
npm run dev
```

Works fully without Redis/Blob attached (falls back to in-memory storage for
dashboard content, and rejects file uploads with a clear message until Blob
is attached — pasted links still work everywhere).

## Architecture notes

- `src/data/*.json` — the original curated content (never modified by the app).
- `src/lib/content-store.ts` — merges that curated content with anything added
  via the dashboard (stored in Redis), so the two are indistinguishable to the
  rest of the app.
- `src/lib/adapter.ts` — the portable read layer + password verification.
- Static export (for a future Tauri/Electron/Capacitor build) is still wired up:
  run `STATIC_EXPORT=true npm run build` — note the dashboard/API routes won't
  work in that mode since there's no server; that path is for a read-only
  offline shell of the curated content.
