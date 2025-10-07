import { NextRequest, NextResponse } from 'next/server'
import { dbPOC } from '@/lib/database-poc'
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

// GET /api/run/verify - Verify a task using database data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('run_id')
    const flowId = searchParams.get('flowId')

    if (!runId) {
      return NextResponse.json({ error: 'run_id is required' }, { status: 400 })
    }

    if (!flowId) {
      return NextResponse.json({ error: 'flowId is required' }, { status: 400 })
    }

    const flow = flowVerifiers.flows[flowId as keyof typeof flowVerifiers.flows]

    if (!flow) {
      return NextResponse.json({ error: `Flow '${flowId}' not found` }, { status: 404 })
    }

    // Get stored data from database for this run
    const storedData = await dbPOC.bulkGet(runId, ['multicategory-cart'])

    if (!storedData.items || storedData.items.length === 0) {
      return NextResponse.json({ error: 'No data found for this run' }, { status: 404 })
    }

    // Find the cart data in stored items
    const cartData = storedData.items.find((item: { key: string, value: any }) => item.key === 'multicategory-cart')

    if (!cartData) {
      return NextResponse.json({ error: 'Cart data not found for this run' }, { status: 404 })
    }

    const startTime = performance.now()

    // Parse the stored cart data
    let finalCartState: CartState
    try {
      const parsedData = JSON.parse(cartData.v)
      finalCartState = parsedData.state || parsedData
    } catch (e) {
      finalCartState = getDefaultCartState()
    }

    const mockLocalStorage = {
      getItem: (key: string) => {
        if (key === 'multicategory-cart') {
          // Return the complete stored data as JSON string
          return JSON.stringify(cartData.value)
        }
        // Check other stored keys
        const otherData = storedData.items.find((item: { key: string, value: any }) => item.key === key)
        return otherData ? otherData.value : null
      },
      setItem: (key: string, value: string) => {
        // Mock setItem - no-op for database verification
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

    // Create execution context with mocks
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

    // Execute the verifier code with the mock context
    let verificationResult: boolean | undefined
    try {
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
          actualItems: finalCartState.items?.map((item: { itemName?: string, name?: string, quantity: number }) => `${item.itemName || item.name} x${item.quantity}`) || []
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
        actualItems: finalCartState.items?.map((item: { itemName?: string, name?: string, quantity: number }) => `${item.itemName || item.name} x${item.quantity}`) || []
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
