import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

// POST /api/run/init - Initialize a new run
export async function POST(request: NextRequest) {
  try {
    const { run_id } = await request.json()

    if (!run_id || typeof run_id !== 'string') {
      return NextResponse.json({ error: 'run_id is required and must be a string' }, { status: 400 })
    }

    const result = await dbPOC.initRun(run_id)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize run' }, { status: 500 })
  }
}
