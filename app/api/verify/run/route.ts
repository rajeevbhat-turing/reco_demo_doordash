import { NextRequest, NextResponse } from 'next/server'
import tasks from '@/data/tasks.json'
import { sortObjectKeys, processJsonWithHtmlTags, stringifyReplacer, KEYS_TO_CLEAN } from '@/lib/verification-utils'

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

    if (!tasks[flowId as keyof typeof tasks]) {
      return NextResponse.json({ error: `Task '${flowId}' not found` }, { status: 404 })
    }

    const startTime = performance.now()
    
    // Get expected result from tasks.json
    const expectedResult = (tasks as any)[flowId].result
    
    // Use provided browser localStorage data if available, otherwise fall back to cartState or defaults
    let localStorageData: Record<string, string> = {}
    
    if (browserLocalStorage) {
      // Use the provided localStorage data directly
      localStorageData = browserLocalStorage
    } else if (cartState) {
      // Convert cartState to localStorage format
      localStorageData = {
        'multicategory-cart': JSON.stringify({ state: cartState })
      }
    } else {
      return NextResponse.json({ error: 'No localStorage or cartState provided' }, { status: 400 })
    }

    let isPassed = true

    try {
      for (const key of Object.keys(expectedResult)) {
        const expectedValue = expectedResult[key];
        const actualValue = localStorageData[key];

        if (!actualValue) {
          isPassed = false;
          break;
        }

        // Parse and clean both expected and actual values
        const cleanedExpected = processJsonWithHtmlTags(JSON.parse(expectedValue), KEYS_TO_CLEAN);
        const cleanedActual = processJsonWithHtmlTags(JSON.parse(actualValue), KEYS_TO_CLEAN);

        // Sort keys and stringify for comparison
        const readyExpected = JSON.stringify(sortObjectKeys(cleanedExpected), stringifyReplacer, 2);
        const readyActual = JSON.stringify(sortObjectKeys(cleanedActual), stringifyReplacer, 2);

        if (readyExpected !== readyActual) {
          isPassed = false;
          break;
        }
      }

      const executionTime = performance.now() - startTime

      return NextResponse.json({
        flowId,
        passed: isPassed,
        error: null,
        executionTime: Math.round(executionTime * 100) / 100,
        consoleOutput: [],
        description: (tasks as any)[flowId].prompt,
        category: 'verification',
        debugInfo: {
          cartState: cartState || {},
          expectedItems: [],
          actualItems: cartState?.items?.map((item: any) => item.itemName || item.name) || []
        }
      });

    } catch (error) {
      const executionTime = performance.now() - startTime
      return NextResponse.json({
        flowId,
        passed: false,
        error: `Verification process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: Math.round(executionTime * 100) / 100,
        consoleOutput: [],
        description: (tasks as any)[flowId].prompt,
        category: 'verification',
        debugInfo: null
      })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({
      flowId: 'unknown',
      passed: false,
      error: `Verification failed: ${errorMessage}`,
      executionTime: 0,
      consoleOutput: [],
      description: null,
      category: null,
      debugInfo: null
    })
  }
}