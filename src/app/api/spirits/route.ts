import { NextRequest, NextResponse } from 'next/server';
import { getAllSpirits, addSpirit, editSpirit, deleteSpirit } from '@/lib/content-store';
import { requirePermission } from '@/lib/session';
import type { Spirit } from '@/lib/adapter';

export async function GET() {
  const spirits = await getAllSpirits();
  return NextResponse.json({ spirits });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.description) {
    return NextResponse.json({ error: 'name and description are required.' }, { status: 400 });
  }

  const record: Omit<Spirit, 'slug'> = {
    name: body.name,
    category: body.category || 'Spirit',
    origin: body.origin || '',
    abv: Number(body.abv) || 0,
    color: body.color || '#121212',
    tagline: body.tagline || '',
    description: body.description,
    tastingNotes: Array.isArray(body.tastingNotes) ? body.tastingNotes : [],
    bestIn: Array.isArray(body.bestIn) ? body.bestIn : [],
    image: body.image || '',
  };

  const created = await addSpirit(record);
  return NextResponse.json({ spirit: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });

  const { slug: _omit, ...updates } = body;
  const updated = await editSpirit(slug, updates);
  if (!updated) return NextResponse.json({ error: 'Spirit not found.' }, { status: 404 });

  return NextResponse.json({ spirit: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission('delete');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug query param required.' }, { status: 400 });

  const removed = await deleteSpirit(slug);
  return NextResponse.json({ removed });
}
