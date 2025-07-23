import { NextRequest, NextResponse } from 'next/server'
import flowVerifiers from '@/config/flow-verifiers.json'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const flowId = searchParams.get('flowId')
  const action = searchParams.get('action') // 'get', 'execute', 'getAll', or 'run'

  // Handle getting all flows
  if (action === 'getAll') {
    const flows = Object.entries(flowVerifiers.flows).map(([id, flow]) => ({
      flowId: id,
      description: flow.description,
      category: flow.category
    }))

    return NextResponse.json({
      flows: flows.sort((a, b) => a.category.localeCompare(b.category) || a.flowId.localeCompare(b.flowId))
    })
  }

  if (!flowId) {
    return NextResponse.json({ error: 'flowId parameter is required' }, { status: 400 })
  }

  const flow = flowVerifiers.flows[flowId as keyof typeof flowVerifiers.flows]
  
  if (!flow) {
    return NextResponse.json({ error: `Flow '${flowId}' not found` }, { status: 404 })
  }

  if (action === 'get') {
    // Return flow information for confirmation
    return NextResponse.json({
      flowId,
      description: flow.description,
      category: flow.category,
      verifier: flow.verifier
    })
  }

  if (action === 'execute') {
    // Return verifier code for client-side execution
    return NextResponse.json({
      flowId,
      verifierCode: flow.verifier,
      description: flow.description
    })
  }

  if (action === 'run') {
    // Execute verifier server-side and return results
    try {
      const startTime = performance.now()
      
      // Create a mock localStorage for server-side execution
      // In a real scenario, you might want to pass cart state as a parameter
      const mockLocalStorage = {
        getItem: (key: string) => {
          // You could accept cart state as a query parameter or request body
          // For now, return empty state - this would need to be enhanced
          if (key === 'multicategory-cart') {
            return JSON.stringify({
              state: {
                items: [],
                currentStore: null,
                searchResults: [],
                lastSearchInfo: null,
                lastClearInfo: null,
                lastRemovalInfo: null,
                currentCategory: null,
                verifierConsumed: false,
                searchVerifierConsumed: false,
                removalVerifierConsumed: false
              }
            })
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

      // Create execution context with mocks
      const context = {
        localStorage: mockLocalStorage,
        console: mockConsole,
        window: {
          useCartStore: {
            getState: () => ({
              markSearchVerifierConsumed: () => {},
              markVerifierConsumed: () => {},
              markRemovalVerifierConsumed: () => {},
              markQuantityVerifierConsumed: () => {},
              markOrderVerifierConsumed: () => {}
            })
          }
        }
      }

      // Execute the verifier code with the mock context
      let result: boolean | undefined
      try {
        // Create function with the mock context
        const verifierFunction = new Function(
          'localStorage', 'console', 'window',
          `return (${flow.verifier})()`
        )
        result = verifierFunction(context.localStorage, context.console, context.window)
      } catch (execError) {
        const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
        return NextResponse.json({
          flowId,
          passed: false,
          error: `Verifier execution failed: ${errorMessage}`,
          executionTime: Math.round((performance.now() - startTime) * 100) / 100,
          consoleOutput,
          description: flow.description,
          category: flow.category
        })
      }

      const executionTime = performance.now() - startTime

      return NextResponse.json({
        flowId,
        passed: result,
        error: null,
        executionTime: Math.round(executionTime * 100) / 100,
        consoleOutput: consoleOutput.filter(log => 
          log.includes(`[VERIFIER ${flowId}]`) || log.includes('Verifier error')
        ),
        description: flow.description,
        category: flow.category
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return NextResponse.json({
        flowId,
        passed: false,
        error: `Verification failed: ${errorMessage}`,
        executionTime: 0,
        consoleOutput: [],
        description: flow.description,
        category: flow.category
      })
    }
  }

  // Default: return flow info
  return NextResponse.json({
    flowId,
    description: flow.description,
    category: flow.category
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { flowId, result, error, cartState } = body

  // Handle programmatic execution with cart state
  if (cartState && flowId) {
    const flow = flowVerifiers.flows[flowId as keyof typeof flowVerifiers.flows]
    
    if (!flow) {
      return NextResponse.json({ error: `Flow '${flowId}' not found` }, { status: 404 })
    }

    try {
      const startTime = performance.now()
      
      // Create a mock localStorage with the provided cart state
      const mockLocalStorage = {
        getItem: (key: string) => {
          if (key === 'multicategory-cart') {
            return JSON.stringify({ state: cartState })
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

      // Create execution context with mocks
      const context = {
        localStorage: mockLocalStorage,
        console: mockConsole,
        window: {
          useCartStore: {
            getState: () => ({
              markSearchVerifierConsumed: () => {},
              markVerifierConsumed: () => {},
              markRemovalVerifierConsumed: () => {},
              markQuantityVerifierConsumed: () => {},
              markOrderVerifierConsumed: () => {}
            })
          }
        }
      }

      // Execute the verifier code with the mock context
      let verificationResult: boolean | undefined
      try {
        // Create function with the mock context
        const verifierFunction = new Function(
          'localStorage', 'console', 'window',
          `return (${flow.verifier})()`
        )
        verificationResult = verifierFunction(context.localStorage, context.console, context.window)
      } catch (execError) {
        const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
        return NextResponse.json({
          flowId,
          passed: false,
          error: `Verifier execution failed: ${errorMessage}`,
          executionTime: Math.round((performance.now() - startTime) * 100) / 100,
          consoleOutput,
          description: flow.description,
          category: flow.category
        })
      }

      const executionTime = performance.now() - startTime

      return NextResponse.json({
        flowId,
        passed: verificationResult,
        error: null,
        executionTime: Math.round(executionTime * 100) / 100,
        consoleOutput: consoleOutput.filter(log => 
          log.includes(`[VERIFIER ${flowId}]`) || log.includes('Verifier error')
        ),
        description: flow.description,
        category: flow.category
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return NextResponse.json({
        flowId,
        passed: false,
        error: `Verification failed: ${errorMessage}`,
        executionTime: 0,
        consoleOutput: [],
        description: flow.description,
        category: flow.category
      })
    }
  }

  // Log verification result (you could store this in a database)
  console.log(`Verification Result for ${flowId}:`, {
    passed: result,
    error: error || null,
    timestamp: new Date().toISOString()
  })

  return NextResponse.json({
    logged: true,
    flowId,
    result
  })
} 