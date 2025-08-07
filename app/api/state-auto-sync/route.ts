import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, state, timestamp } = await request.json()

    if (!sessionId || !state) {
      return NextResponse.json({ error: 'sessionId and state required' }, { status: 400 })
    }

    // Save complete state to database with metadata
    await dbPOC.saveState(sessionId, {
      ...state,
      lastSyncTimestamp: timestamp,
      syncedAt: new Date().toISOString(),
      syncSource: 'auto-sync'
    })
    
    // Return minimal response for performance
    return NextResponse.json({ 
      synced: true,
      sessionId: sessionId.slice(-8), // Return last 8 chars for logging
      timestamp 
    })
    
  } catch (error) {
    console.error('Auto-sync error:', error)
    // Don't fail the UI - just log and return success to prevent retries
    return NextResponse.json({ 
      synced: false, 
      error: 'Sync failed but UI can continue' 
    }, { status: 200 })
  }
}

// Optional: GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const state = await dbPOC.getState(sessionId)
    
    return NextResponse.json({ 
      sessionId,
      hasState: !!state,
      lastSync: state?.syncedAt || null,
      cartItems: state?.items?.length || 0,
      currentStore: state?.currentStore?.name || null
    })
    
  } catch (error) {
    console.error('Get sync status error:', error)
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 })
  }
} 