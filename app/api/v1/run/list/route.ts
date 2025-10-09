import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

// GET /api/v1/run/list - List all runs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '-1')

    const result = await dbPOC.listRuns(limit)
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list runs' }, { status: 500 })
  }
}
