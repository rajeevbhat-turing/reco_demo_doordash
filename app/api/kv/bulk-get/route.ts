import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

// POST /api/kv/bulk-get - Bulk get key-value pairs for a run
export async function POST(request: NextRequest) {
  try {
    const { run_id, keys } = await request.json()

    if (!run_id || typeof run_id !== 'string') {
      return NextResponse.json({ error: 'run_id is required and must be a string' }, { status: 400 })
    }

    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'keys must be an array' }, { status: 400 })
    }

    const result = await dbPOC.bulkGet(run_id, keys)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to bulk get' }, { status: 500 })
  }
}
