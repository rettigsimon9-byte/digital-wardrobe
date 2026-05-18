import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function parseItem(item: {
  id: string; userId: string; name: string; category: string; subcategory: string;
  colors: string; colorHex: string; style: string; season: string;
  description: string; tags: string; imageData: string; thumbnail: string;
  createdAt: Date;
}) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    colors: JSON.parse(item.colors),
    colorHex: JSON.parse(item.colorHex),
    style: JSON.parse(item.style),
    season: JSON.parse(item.season),
    description: item.description,
    tags: JSON.parse(item.tags),
    imageData: item.imageData,
    thumbnail: item.thumbnail,
    createdAt: item.createdAt.getTime(),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const items = await prisma.clothingItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(items.map(parseItem));
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  try {
    const body = await request.json();

    const item = await prisma.clothingItem.create({
      data: {
        userId: session.user.id,
        name: body.name ?? '',
        category: body.category ?? 'tops',
        subcategory: body.subcategory ?? '',
        colors: JSON.stringify(body.colors ?? []),
        colorHex: JSON.stringify(body.colorHex ?? []),
        style: JSON.stringify(body.style ?? []),
        season: JSON.stringify(body.season ?? []),
        description: body.description ?? '',
        tags: JSON.stringify(body.tags ?? []),
        imageData: body.imageData ?? '',
        thumbnail: body.thumbnail ?? '',
      },
    });

    return NextResponse.json(parseItem(item));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('POST /api/clothing error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
