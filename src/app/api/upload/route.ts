import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requirePermission } from '@/lib/session';

/**
 * Two modes, both producing a stable, publicly-fetchable URL your content
 * JSON can point to as `image`:
 *   1. multipart/form-data with a `file` field  -> uploaded to Vercel Blob
 *   2. JSON body { "url": "https://..." }        -> validated and passed through
 *
 * Requires BLOB_READ_WRITE_TOKEN, which Vercel injects automatically once
 * a Blob store is attached to the project (Storage tab -> Create Blob store).
 */
export async function POST(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => null);
    const url = body?.url;
    if (typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'A valid public https URL is required.' }, { status: 400 });
    }
    return NextResponse.json({ url, source: 'link' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'No Blob store attached. In your Vercel project, go to Storage -> Create Database -> Blob, then redeploy.',
      },
      { status: 503 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'A file field is required.' }, { status: 400 });
  }

  const MAX_BYTES = 8 * 1024 * 1024; // 8MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds the 8MB limit.' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are accepted.' }, { status: 415 });
  }

  const blob = await put(`library/${Date.now()}-${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url, source: 'upload' }, { status: 201 });
}
