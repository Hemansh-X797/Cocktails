import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, addTool, editTool, deleteTool } from '@/lib/content-store';
import { requirePermission } from '@/lib/session';
import type { Tool } from '@/lib/adapter';

export async function GET() {
  const tools = await getAllTools();
  return NextResponse.json({ tools });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.description) {
    return NextResponse.json({ error: 'name and description are required.' }, { status: 400 });
  }

  const record: Omit<Tool, 'slug'> = {
    name: body.name,
    category: body.category || 'Tool',
    material: body.material || '',
    tagline: body.tagline || '',
    description: body.description,
    specs: Array.isArray(body.specs) ? body.specs : [],
    image: body.image || '',
  };

  const created = await addTool(record);
  return NextResponse.json({ tool: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });

  const { slug: _omit, ...updates } = body;
  const updated = await editTool(slug, updates);
  if (!updated) return NextResponse.json({ error: 'Tool not found.' }, { status: 404 });

  return NextResponse.json({ tool: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission('delete');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug query param required.' }, { status: 400 });

  const removed = await deleteTool(slug);
  return NextResponse.json({ removed });
}
