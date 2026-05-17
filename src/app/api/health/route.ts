import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL ?? '(not set)',
    railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN ?? '(not set)',
    nodeEnv: process.env.NODE_ENV,
  });
}
