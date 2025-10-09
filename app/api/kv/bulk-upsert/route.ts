import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

// POST /api/kv/bulk-upsert - Bulk upsert key-value pairs for a run
export async function POST(request: NextRequest) {
  try {
    const { run_id, items } = await request.json()

    if (!run_id || typeof run_id !== 'string') {
      return NextResponse.json({ error: 'run_id is required and must be a string' }, { status: 400 })
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
    }

    // Validate items structure
    for (const item of items) {
      if (!item.key || typeof item.key !== 'string') {
        return NextResponse.json({ error: 'Each item must have a valid key' }, { status: 400 })
      }
    }

    const result = await dbPOC.bulkUpsert(run_id, items)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to bulk upsert' }, { status: 500 })
  }
}
