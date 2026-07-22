# My Cocktail Guide

A private, avant-garde archive of haute mixology — 169-frame scroll-scrubbed hero,
physics cursor, kinetic cards, and a real dashboard for adding drinks/spirits/tools
with your own images or public links.

## Deploying to Vercel

1. **Push this repo to GitHub**, then import it in Vercel (New Project → your repo).

2. **Attach storage** (Storage tab in your Vercel project):
   - **Blob** → Create Database → Blob. This is the *only* storage system this
     app needs — it powers both image uploads and the dashboard's content
     (drinks/spirits/tools you add live in a single JSON file inside the same
     Blob store, at `content-store.json`). No Redis, no KV, no second account
     to manage. `BLOB_READ_WRITE_TOKEN` is injected automatically once attached.
   Without it, the app still runs — uploads/adds just won't persist across
   server restarts (a console warning tells you this).

3. **Set one environment variable**: `AUTH_SECRET` — any long random string
   (e.g. `openssl rand -base64 32`). This signs dashboard login sessions.

4. **Deploy.** Vercel auto-detects Next.js; no build command changes needed.

## Favicon

Drop your `favicon.ico` at `public/favicon.ico` — that's it, no code changes
needed. Next.js serves anything in `public/` from the site root, and
`layout.tsx` already points `<link rel="icon">` at `/favicon.ico`.

## Logging into the dashboard

Passwords live (hashed, SHA-256) in `src/data/passwords.json`. Out of the box:

| Key          | Role         | Add/edit drinks & images? | Delete? |
|--------------|--------------|-----------------------------|---------|
| `sovereign`  | master       | Yes                         | Yes     |
| `mixologist` | mixologist   | Yes                         | No      |
| `guest2026`  | guest        | View only                   | No      |

**Change these before sharing the link with friends.** Generate new hashes with:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('yourNewPassword').digest('hex'))"
```

Paste the resulting hash into `src/data/passwords.json`.

### Editing content from the dashboard

Every tab (Cocktails / Spirits / Tools) lists existing items with **Edit** and
**Remove** buttons:
- **Edit** works on *any* item, including the original curated ones (Sovereign
  of the Void, Blavod, etc.) — clicking Edit loads it into the form; saving
  patches it without touching the original JSON file (the patch is stored
  as an "override" and merged in at read time).
- **Remove** only works on items *you* added via the dashboard — the curated
  set is never deletable, only editable, so the archive can't accidentally
  end up empty.

## Adding your own frames / photos

- Drop 169 frames into `public/frames/` named `hero_001.webp` … `hero_169.webp`
  (any consistent aspect ratio; the canvas cover-fits automatically).
- For cocktail/spirit/tool photos, either add files under `public/images/...`
  and reference them in the JSON `image` field, or — much easier — just use
  the **dashboard**: log in, go to a tab, click Edit (or Add), and either
  upload a file or paste a public image URL. It's stored for you and shows
  up on the site immediately. Until a real photo exists, cards show a tasteful
  gradient placeholder instead of a broken image icon.

## The two 3D carousels

- **Image carousel** (`ImageCarousel3D`) — a CSS-3D coverflow of your actual
  cocktail/spirit photos; scroll inside the frame to advance, one slide per
  scroll "tick," snapping via transition easing.
- **Object carousel** (`ObjectCarousel3D`) — three fully procedural 3D objects
  (shaker, jigger, rocks glass — built from Three.js primitives and lathe
  geometry, no model files) arranged in a shallow arc. Scrolling cycles their
  slot assignment (center/left/right) with a continuous per-frame lerp toward
  each new target, which is what gives the "magnetic" settling feel rather
  than a hard snap.

## Local development

```bash
npm install
npm run dev
```

Works fully without Blob attached in dev — dashboard adds/edits just won't
persist between server restarts, and image uploads return a clear error
until Blob is attached (pasted links still work everywhere, always).

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
