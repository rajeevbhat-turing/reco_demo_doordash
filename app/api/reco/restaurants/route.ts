import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const rows = await db.query<{ id: number; name: string; cuisine: string | null }>(
    'SELECT id, name, cuisine FROM restaurants ORDER BY name'
  );
  return NextResponse.json(rows);
}
