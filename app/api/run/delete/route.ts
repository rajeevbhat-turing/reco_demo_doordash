import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

// POST /api/run/delete - Delete runs
export async function POST(request: NextRequest) {
  try {
    const { run_ids } = await request.json()

    if (!Array.isArray(run_ids)) {
      return NextResponse.json({ error: 'invalid input: expected array of run_ids' }, { status: 400 })
    }

    const result = await dbPOC.deleteRuns(run_ids)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete runs' }, { status: 500 })
  }
}
