import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

// GET /api/v1/run/export - Export all data for a run
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const run_id = searchParams.get('run_id')

    if (!run_id) {
      return NextResponse.json({ error: 'run_id is required' }, { status: 400 })
    }

    const result = await dbPOC.exportRun(run_id)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export run' }, { status: 500 })
  }
}
