import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/reco/agent/credential
 *
 * Returns the plaintext password for a gym user, so the LLM agent can
 * type it into the `Use password instead` sign-in flow. The gym is a
 * demo with plaintext passwords in `users.password`, same as how
 * `/api/auth/generate-otp` returns OTPs in the response body —
 * symmetric, but explicitly gated by `RECO_DEMO=1` so production
 * never exposes this route.
 *
 * Body: `{ email: string }`
 * 200: `{ password: string }`
 * 404: user not found OR `RECO_DEMO` unset
 * 400: malformed body
 */
export async function POST(request: NextRequest) {
  if (process.env.RECO_DEMO !== '1') {
    return new NextResponse(null, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const email = (body as { email?: unknown })?.email;
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const row = await db.queryOne<{ password: string }>(
    'SELECT password FROM users WHERE email = ?',
    [email]
  );
  if (!row) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }
  return NextResponse.json({ password: row.password });
}
