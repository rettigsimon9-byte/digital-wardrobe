import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const item = await prisma.clothingItem.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }

  await prisma.clothingItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
