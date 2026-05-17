import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function parseOutfit(outfit: {
  id: string; userId: string; itemIds: string; name: string;
  description: string; occasion: string; colorScheme: string;
  stylingTip: string; createdAt: Date;
}) {
  return {
    id: outfit.id,
    itemIds: JSON.parse(outfit.itemIds),
    name: outfit.name,
    description: outfit.description,
    occasion: outfit.occasion,
    colorScheme: outfit.colorScheme,
    stylingTip: outfit.stylingTip,
    createdAt: outfit.createdAt.getTime(),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const outfits = await prisma.outfit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(outfits.map(parseOutfit));
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const body = await request.json();

  const outfit = await prisma.outfit.create({
    data: {
      userId: session.user.id,
      itemIds: JSON.stringify(body.itemIds),
      name: body.name,
      description: body.description,
      occasion: body.occasion,
      colorScheme: body.colorScheme,
      stylingTip: body.stylingTip,
    },
  });

  return NextResponse.json(parseOutfit(outfit));
}
