import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'
import flowVerifiers from '@/config/flow-verifiers.json'

export async function POST(request: NextRequest) {
  try {
    const { taskId, sessionId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    // Get current state from database
    const currentState = await dbPOC.getState(sessionId)
    
    if (!currentState) {
      return NextResponse.json({ 
        taskId,
        passed: false,
        error: 'No state found for session. Agent may not have performed any actions yet.',
        sessionFound: false,
        sessionId
      }, { status: 404 })
    }

    // Get verifier
    const flow = flowVerifiers.flows[taskId as keyof typeof flowVerifiers.flows]
    if (!flow) {
      return NextResponse.json({ 
        error: `Task '${taskId}' not found`,
        availableTasks: Object.keys(flowVerifiers.flows).slice(0, 5) // Show first 5 as examples
      }, { status: 404 })
    }

    // Execute verifier with database state
    const startTime = performance.now()
    let passed: boolean | undefined
    let error: string | null = null
    let consoleOutput: string[] = []

    try {
      // Create verifier execution context
      const mockLocalStorage = {
        getItem: (key: string) => {
          if (key === 'multicategory-cart') {
            return JSON.stringify({ state: currentState })
          }
          return null
        }
      }

      const mockWindow = {
        useCartStore: {
          getState: () => currentState
        }
      }

      // Capture console output from verifier
      const originalConsoleLog = console.log
      const originalConsoleError = console.error
      
      console.log = (...args) => {
        const message = args.join(' ')
        if (message.includes(`[VERIFIER ${taskId}]`) || message.includes('Verifier')) {
          consoleOutput.push(`[LOG] ${message}`)
        }
        originalConsoleLog(...args)
      }
      
      console.error = (...args) => {
        consoleOutput.push(`[ERROR] ${args.join(' ')}`)
        originalConsoleError(...args)
      }

      // Execute verifier
      const verifierFunction = new Function('localStorage', 'window', `
        try {
          ${flow.verifier}
        } catch (e) {
          console.error('[VERIFIER ERROR]', e.message);
          return false;
        }
      `)
      
      passed = verifierFunction(mockLocalStorage, mockWindow)
      
      // Restore console
      console.log = originalConsoleLog
      console.error = originalConsoleError
      
    } catch (execError) {
      error = execError instanceof Error ? execError.message : 'Verifier execution failed'
      passed = false
    }

    const executionTime = performance.now() - startTime

    // Detailed response for debugging and monitoring
    const response = {
      taskId,
      passed,
      error,
      executionTime: Math.round(executionTime * 100) / 100,
      description: flow.description,
      category: flow.category,
      sessionId,
      sessionFound: true,
      timestamp: new Date().toISOString(),
      
      // State snapshot for debugging
      stateSnapshot: {
        cartItems: currentState.items?.length || 0,
        currentStore: currentState.currentStore?.name || null,
        hasSearchResults: (currentState.searchResults?.length || 0) > 0,
        lastSearchTerm: currentState.lastSearchInfo?.searchTerm || null,
        currentCategory: currentState.currentCategory || null,
        hasVerifierFlags: !!(currentState.verifierConsumed || currentState.searchVerifierConsumed || currentState.removalVerifierConsumed)
      },
      
      // Debug info
      debugInfo: {
        stateSyncedAt: currentState.syncedAt,
        syncSource: currentState.syncSource || 'unknown',
        stateAge: currentState.lastSyncTimestamp ? Date.now() - currentState.lastSyncTimestamp : null,
        consoleOutput: consoleOutput.length > 0 ? consoleOutput : null
      }
    }

    // Log successful verification
    console.log(`✅ Verification completed: ${taskId} = ${passed ? 'PASSED' : 'FAILED'} (${response.executionTime}ms)`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ 
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const sessionId = searchParams.get('sessionId')

    if (!taskId || !sessionId) {
      return NextResponse.json({ 
        error: 'Both taskId and sessionId required as query parameters',
        example: '/api/verify-by-session?taskId=search-starbucks&sessionId=your-session-id'
      }, { status: 400 })
    }

    // Forward to POST handler
    return POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, sessionId })
    }))

  } catch (error) {
    return NextResponse.json({ error: 'GET request failed' }, { status: 500 })
  }
} 