import { NextRequest, NextResponse } from 'next/server';
import { getAllCocktails, addCocktail, editCocktail, deleteCocktail } from '@/lib/content-store';
import { requirePermission } from '@/lib/session';
import type { Cocktail } from '@/lib/adapter';

export async function GET() {
  const cocktails = await getAllCocktails();
  return NextResponse.json({ cocktails });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.description) {
    return NextResponse.json({ error: 'name and description are required.' }, { status: 400 });
  }

  const record: Omit<Cocktail, 'slug'> = {
    name: body.name,
    tagline: body.tagline || '',
    heroColor: body.heroColor || '#050505',
    rimColor: body.rimColor || '#8b0000',
    abv: Number(body.abv) || 0,
    servingGlass: body.servingGlass || '',
    prepTime: body.prepTime || '',
    difficulty: body.difficulty || 'Intermediate',
    description: body.description,
    flavorProfile: body.flavorProfile || {},
    ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
    method: Array.isArray(body.method) ? body.method : [],
    pairings: Array.isArray(body.pairings) ? body.pairings : [],
    story: body.story || '',
    image: body.image || '',
  };

  const created = await addCocktail(record);
  return NextResponse.json({ cocktail: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission('upload');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });

  const { slug: _omit, ...updates } = body;
  const updated = await editCocktail(slug, updates);
  if (!updated) return NextResponse.json({ error: 'Cocktail not found.' }, { status: 404 });

  return NextResponse.json({ cocktail: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission('delete');
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug query param required.' }, { status: 400 });

  const removed = await deleteCocktail(slug);
  return NextResponse.json({ removed });
}
