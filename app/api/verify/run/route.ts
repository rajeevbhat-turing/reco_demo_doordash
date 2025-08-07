import { NextRequest, NextResponse } from 'next/server'
import flowVerifiers from '@/config/flow-verifiers.json'

interface CartState {
  items: any[]
  currentStore: any
  searchResults: any[]
  lastSearchInfo: any
  lastClearInfo: any
  lastRemovalInfo: any
  currentCategory: string
  verifierConsumed: boolean
  searchVerifierConsumed: boolean
  removalVerifierConsumed: boolean
  quantityVerifierConsumed: boolean
  orderVerifierConsumed: boolean
  lastQuantityChangeInfo: any
  lastOrderInfo: any
}

interface VerificationResult {
  flowId: string
  passed: boolean | undefined
  error: string | null
  executionTime: number
  consoleOutput: string[]
  description: string
  category: string
  debugInfo?: {
    cartState: CartState
    expectedItems: string[]
    actualItems: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flowId, cartState, localStorage: browserLocalStorage } = body

    if (!flowId) {
      return NextResponse.json({ error: 'flowId is required' }, { status: 400 })
    }

    const flow = flowVerifiers.flows[flowId as keyof typeof flowVerifiers.flows]
    
    if (!flow) {
      return NextResponse.json({ error: `Flow '${flowId}' not found` }, { status: 404 })
    }

    const startTime = performance.now()
    
    // Use provided browser localStorage data if available, otherwise fall back to cartState or defaults
    let finalCartState: CartState
    
    if (browserLocalStorage && browserLocalStorage['multicategory-cart']) {
      // Parse the actual browser localStorage data
      try {
        const parsedData = JSON.parse(browserLocalStorage['multicategory-cart'])
        finalCartState = parsedData.state || parsedData
      } catch (e) {
        finalCartState = cartState || getDefaultCartState()
      }
    } else if (cartState) {
      finalCartState = cartState
    } else {
      finalCartState = getDefaultCartState()
    }
    
    const mockLocalStorage = {
      getItem: (key: string) => {
        if (key === 'multicategory-cart') {
          return JSON.stringify({ state: finalCartState })
        }
        // Support other localStorage keys if provided
        if (browserLocalStorage && browserLocalStorage[key]) {
          return browserLocalStorage[key]
        }
        return null
      }
    }

    // Create a mock console for capturing output
    const consoleOutput: string[] = []
    const mockConsole = {
      log: (...args: any[]) => {
        consoleOutput.push(`[LOG] ${args.join(' ')}`)
      },
      error: (...args: any[]) => {
        consoleOutput.push(`[ERROR] ${args.join(' ')}`)
      }
    }

    // Create execution context with mocks (same as UI implementation)
    const context = {
      localStorage: mockLocalStorage,
      console: mockConsole,
      window: {
        useCartStore: {
          getState: () => ({
            markSearchVerifierConsumed: () => {
              console.log('[MOCK] markSearchVerifierConsumed called')
            },
            markVerifierConsumed: () => {
              console.log('[MOCK] markVerifierConsumed called')
            },
            markRemovalVerifierConsumed: () => {
              console.log('[MOCK] markRemovalVerifierConsumed called')
            },
            markQuantityVerifierConsumed: () => {
              console.log('[MOCK] markQuantityVerifierConsumed called')
            },
            markOrderVerifierConsumed: () => {
              console.log('[MOCK] markOrderVerifierConsumed called')
            }
          })
        }
      }
    }

    // Execute the verifier code with the mock context (same as UI)
    let verificationResult: boolean | undefined
    try {
      // Create function with the mock context - same as UI implementation
      const verifierFunction = new Function(
        'localStorage', 'console', 'window',
        `return (function() { ${flow.verifier} })()`
      )
      verificationResult = verifierFunction(context.localStorage, context.console, context.window)
    } catch (execError) {
      const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
      
      const result: VerificationResult = {
        flowId,
        passed: false,
        error: `Verifier execution failed: ${errorMessage}`,
        executionTime: Math.round((performance.now() - startTime) * 100) / 100,
        consoleOutput,
        description: flow.description,
        category: flow.category,
        debugInfo: {
          cartState: finalCartState,
          expectedItems: extractExpectedItems(flow.description),
          actualItems: finalCartState.items?.map((item: any) => `${item.itemName || item.name} x${item.quantity}`) || []
        }
      }
      
      return NextResponse.json(result)
    }

    const executionTime = performance.now() - startTime

    const result: VerificationResult = {
      flowId,
      passed: verificationResult,
      error: null,
      executionTime: Math.round(executionTime * 100) / 100,
      consoleOutput: consoleOutput.filter(log => 
        log.includes(`[VERIFIER ${flowId}]`) || 
        log.includes('Verifier error') ||
        log.includes('[MOCK]')
      ),
      description: flow.description,
      category: flow.category,
      debugInfo: {
        cartState: finalCartState,
        expectedItems: extractExpectedItems(flow.description),
        actualItems: finalCartState.items?.map((item: any) => `${item.itemName || item.name} x${item.quantity}`) || []
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({
      error: `API request failed: ${errorMessage}`
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const flowId = searchParams.get('flowId')

  if (!flowId) {
    return NextResponse.json({ error: 'flowId parameter is required' }, { status: 400 })
  }

  const flow = flowVerifiers.flows[flowId as keyof typeof flowVerifiers.flows]
  
  if (!flow) {
    return NextResponse.json({ error: `Flow '${flowId}' not found` }, { status: 404 })
  }

  // For GET requests, just return the verifier info and suggest using POST with actual state
  return NextResponse.json({
    flowId,
    description: flow.description,
    category: flow.category,
    message: "Use POST method with actual browser localStorage data for accurate verification",
    example: {
      method: "POST",
      body: {
        flowId: flowId,
        localStorage: {
          "multicategory-cart": "/* actual browser localStorage data */"
        }
      }
    }
  })
}

// Helper functions
function getDefaultCartState(): CartState {
  return {
    items: [],
    currentStore: null,
    searchResults: [],
    lastSearchInfo: null,
    lastClearInfo: null,
    lastRemovalInfo: null,
    currentCategory: 'restaurant',
    verifierConsumed: false,
    searchVerifierConsumed: false,
    removalVerifierConsumed: false,
    quantityVerifierConsumed: false,
    orderVerifierConsumed: false,
    lastQuantityChangeInfo: null,
    lastOrderInfo: null
  }
}

function extractExpectedItems(description: string): string[] {
  const items: string[] = []
  
  // Extract common patterns from descriptions
  const patterns = [
    /sweet pretzel/i,
    /coffee/i,
    /latte/i,
    /croissant/i,
    /cooler bag/i,
    /mint mojito/i,
    /ham, egg and cheese/i
  ]
  
  patterns.forEach(pattern => {
    const match = description.match(pattern)
    if (match) {
      items.push(match[0])
    }
  })
  
  return items
} 