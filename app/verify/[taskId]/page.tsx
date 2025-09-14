"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

interface VerificationResult {
  flowId: string
  passed: boolean | undefined
  error: string | null
  executionTime: number
  consoleOutput: string[]
  description: string
  category: string
  debugInfo?: {
    cartState: any
    expectedItems: string[]
    actualItems: string[]
  }
}

export default function VerifyTaskPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isRunning, setIsRunning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => generateSessionId())

  // Generate a unique session ID for this browser session
  function generateSessionId(): string {
    const timestamp = Date.now().toString()
    const random = globalThis.crypto.randomUUID().split('-')[0]
    return `${timestamp.slice(-8)}-${random}`
  }

  const captureCurrentState = () => {
    try {
      const cartState = JSON.parse(localStorage.getItem('multicategory-cart') || '{}')
      const state = cartState.state || {}
      
      return {
        cartItems: state.items || [],
        currentStore: state.currentStore || null,
        searchResults: state.searchResults || [],
        lastSearchInfo: state.lastSearchInfo || null,
        lastClearInfo: state.lastClearInfo || null,
        lastRemovalInfo: state.lastRemovalInfo || null,
        lastOrderInfo: state.lastOrderInfo || null,
        currentCategory: state.currentCategory || null,
        verifierConsumed: state.verifierConsumed || false,
        searchVerifierConsumed: state.searchVerifierConsumed || false,
        removalVerifierConsumed: state.removalVerifierConsumed || false,
        orderVerifierConsumed: state.orderVerifierConsumed || false,
        // Raw state for debugging
        rawState: state
      }
    } catch (error) {
      return { error: `Failed to parse cart state: ${error}` }
    }
  }

  const logExecution = async (result: VerificationResult) => {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        taskId: result.flowId,
        passed: result.passed,
        executionTime: result.executionTime,
        error: result.error,
        description: result.description,
        cartItemCount: 0,
        currentStore: null,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: sessionId
      }

      await fetch('/api/log-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      })
    } catch (error) {
      console.error('Failed to log execution:', error)
    }
  }

  const executeVerification = async () => {
    if (!taskId.trim()) {
      setError('Invalid task ID')
      setIsRunning(false)
      return
    }

    try {
      const startTime = performance.now()
      
      // Capture state before verification
      const stateBefore = captureCurrentState()
      
      // Capture console logs
      const originalConsoleLog = console.log
      const originalConsoleError = console.error
      const consoleOutput: string[] = []
      
      console.log = (...args) => {
        consoleOutput.push(`[LOG] ${args.join(' ')}`)
        originalConsoleLog(...args)
      }
      
      console.error = (...args) => {
        consoleOutput.push(`[ERROR] ${args.join(' ')}`)
        originalConsoleError(...args)
      }
      
      // Get verifier code from API
      const response = await fetch(`/api/verify?flowId=${encodeURIComponent(taskId)}&action=execute`)
      const data = await response.json()

      if (!response.ok) {
        const failureResult = {
          flowId: taskId,
          passed: false,
          error: data.error || 'Failed to get verifier code',
          executionTime: 0,
          consoleOutput,
          description: 'Unknown task',
          category: 'unknown',
        debugInfo: {
          cartState: stateBefore,
          expectedItems: extractExpectedItems(data.description || ''),
          actualItems: stateBefore.cartItems?.map((item: any) => `${item.itemName || item.name} x${item.quantity}`) || []
        }
        }
        setResult(failureResult)
        await logExecution(failureResult)
        setIsRunning(false)
        return
      }

      // Execute verifier code in browser context
      let verifierPassed: boolean | undefined
      try {
        const verifierFunction = new Function(data.verifierCode)
        verifierPassed = verifierFunction()
      } catch (execError) {
        console.error('Verifier execution error:', execError)
        verifierPassed = false
      }

      // Restore original console
      console.log = originalConsoleLog
      console.error = originalConsoleError

      const endTime = performance.now()
      const executionTime = Math.round((endTime - startTime) * 100) / 100

      // Capture state after verification
      const stateAfter = captureCurrentState()

      const finalResult = {
        flowId: taskId,
        passed: verifierPassed,
        error: null,
        executionTime,
        consoleOutput: consoleOutput.filter(log => 
          log.includes(`[VERIFIER ${taskId}]`) || log.includes('Verifier error')
        ),
        description: data.description || 'Task execution',
        category: 'unknown',
        debugInfo: {
          cartState: stateAfter,
          expectedItems: extractExpectedItems(data.description || ''),
          actualItems: stateAfter.cartItems?.map((item: any) => `${item.itemName || item.name} x${item.quantity}`) || []
        }
      }

      setResult(finalResult)
      await logExecution(finalResult)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const errorResult = {
        flowId: taskId,
        passed: false,
        error: `Verification failed: ${errorMessage}`,
        executionTime: 0,
        consoleOutput: [],
        description: 'Task execution',
        category: 'unknown',
        debugInfo: {
          cartState: captureCurrentState(),
          expectedItems: [],
          actualItems: []
        }
      }
      setResult(errorResult)
      await logExecution(errorResult)
    } finally {
      setIsRunning(false)
    }
  }

  // Auto-execute verification when component mounts
  useEffect(() => {
    if (taskId) {
      executeVerification()
    }
  }, [taskId])

  const getStatusIcon = () => {
    if (isRunning) {
      return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    }
    
    if (result?.passed === true) {
      return <CheckCircle className="w-8 h-8 text-green-600" />
    } else if (result?.passed === false) {
      return <XCircle className="w-8 h-8 text-red-600" />
    } else {
      return <AlertCircle className="w-8 h-8 text-yellow-600" />
    }
  }

  const getStatusText = () => {
    if (isRunning) return 'Running...'
    if (result?.passed === true) return 'Passed!'
    if (result?.passed === false) return 'Failed'
    return 'Unknown'
  }

  const getStatusColor = () => {
    if (isRunning) return 'text-blue-600'
    if (result?.passed === true) return 'text-green-600'
    if (result?.passed === false) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getBgColor = () => {
    if (isRunning) return 'bg-blue-50 border-blue-200'
    if (result?.passed === true) return 'bg-green-50 border-green-200'
    if (result?.passed === false) return 'bg-red-50 border-red-200'
    return 'bg-yellow-50 border-yellow-200'
  }

  const extractExpectedItems = (description: string): string[] => {
    const items: string[] = []
    const desc = description.toLowerCase()
    
    // Extract specific items from descriptions
    if (desc.includes('sweet pretzel')) items.push('sweet pretzel')
    if (desc.includes('mint mojito iced coffee')) items.push('Mint Mojito Iced Coffee')
    if (desc.includes('coffee')) items.push('coffee')
    if (desc.includes('latte')) items.push('latte')
    if (desc.includes('milk')) items.push('milk')
    if (desc.includes('eggs')) items.push('eggs')
    if (desc.includes('fruits')) items.push('fruits')
    if (desc.includes('kiwi')) items.push('kiwi')
    if (desc.includes('avocado')) items.push('avocado')
    if (desc.includes('strawberries')) items.push('strawberries')
    if (desc.includes('blue cooler bag')) items.push('Blue Cooler Bag')
    if (desc.includes('ham, egg and cheese croissant')) items.push('Ham, Egg and Cheese Croissant')
    if (desc.includes('lays crisps')) items.push('Lays Crisps')
    if (desc.includes('fruit punch')) items.push('fruit punch')
    if (desc.includes('red bull')) items.push('red bull')
    if (desc.includes('airpods')) items.push('AirPods Pro 2')
    if (desc.includes('dog poop bag')) items.push('dog poop bag')
    if (desc.includes('cat shampoo')) items.push('cat shampoo')
    if (desc.includes('dog cupcake')) items.push('dog cupcake')
    
    // For clear cart tasks, expect 3 items to be cleared
    if (desc.includes('clear') && desc.includes('cart')) {
      items.push('3 items in cart (to be cleared)')
    }
    
    return items
  }

  const getExpectedState = () => {
    if (!result) return 'Loading...'
    
    // Get the task description to understand what's expected
    const description = result.description || ''
    const taskId = result.flowId || ''
    
    // Create expected state description based on task type
    if (taskId === 'clear-cart') {
      return 'Must have 3 items in cart, then clear them.'
    }
    
    if (taskId === 'add-milk-from-safeway') {
      return 'Must be at Safeway store with exactly 1 milk item in cart.'
    }
    
    if (taskId === 'add-fruits') {
      return 'Must be at Gus\'s Community Market with exactly 3 items: 1 Avocado, 3 Kiwi, 1 Strawberries.'
    }
    
    if (taskId === 'add-cooler-bag') {
      return 'Must be at Boichik Bagels with exactly 1 "Blue Cooler Bag" item.'
    }
    
    if (taskId === 'add-most-ordered') {
      return 'Must be at Philz Coffee with exactly 1 "Mint Mojito Iced Coffee" item.'
    }
    
    if (taskId === 'add-customized-croissant') {
      return 'Must be at Gateway Croissant with 1 "Ham, Egg and Cheese Croissant" with customizations: Large, Light Salad, Fruit Portion, Juice, Low Sugar.'
    }
    
    if (taskId === 'add-organic-eggs') {
      return 'Must be at Sprouts Farmers Market with exactly 1 eggs item (quantity 2).'
    }
    
    if (taskId === 'add-pet-items') {
      return 'Must be at PetSmart with exactly 2 items: "Earth Rated Dog Poop Bags" and "Advantage Treatment Shampoo for Cats & Kittens".'
    }
    
    if (taskId === 'order-7eleven-with-tip') {
      return 'Must complete order from 7-Eleven with: 2 Lays Crisps, 1 fruit punch, 1 red bull, $5 tip.'
    }
    
    if (taskId === 'buy-dog-cupcake') {
      return 'Must complete order with 1 dog cupcake item.'
    }
    
    if (taskId === 'add-sweet-pretzel') {
      return 'Must have exactly 1 "sweet pretzel" item from Jamba Juice (152 Kearny Street) in cart.'
    }
    
    if (taskId === 'add-two-custom-lattes') {
      return 'Must be at Starbucks with exactly 2 Caffè Latte items: one vegan medium size and one low sugar small size.'
    }
    
    if (taskId === 'add-airpods') {
      return 'Must be at Best Buy with exactly 1 AirPods Pro 2 item (quantity 2) in cart.'
    }
    
    if (taskId === 'add-gift-from-michaels') {
      return 'Must be at Michaels with exactly 1 item priced at $2.99 in cart.'
    }
    
    if (taskId === 'sequential-starbucks-bagel') {
      return 'Must have 2 recent orders: first order from Starbucks with latte, second order with bagel from any restaurant.'
    }
    
    if (taskId === 'reorder-pet-treats') {
      return 'Must have latest order with exactly 2 items: 2 Icelandic Herring Cat Treats and 1 Icelandic Cod Dog Treats (no other items).'
    }
    
    // Generic fallback based on description
    if (description.toLowerCase().includes('clear') && description.toLowerCase().includes('cart')) {
      return 'Must clear cart with exactly 3 items.'
    }
    
    if (description.toLowerCase().includes('order') && description.toLowerCase().includes('tip')) {
      return 'Must complete order with specific items and tip amount.'
    }
    
    if (description.toLowerCase().includes('add') && description.toLowerCase().includes('store')) {
      return 'Must be at correct store with specified items in cart.'
    }
    
    return 'Follow the task description to set up the required state.'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Status Card */}
        <div className={`border rounded-lg p-8 ${getBgColor()}`}>
          {/* Task ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Task ID</label>
            <div className="text-lg font-mono bg-white px-4 py-2 rounded border">
              {taskId}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center bg-white px-4 py-4 rounded border">
              {getStatusIcon()}
              <span className={`ml-4 text-2xl font-bold ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>

          {/* Expected State */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected State</label>
            <div className="text-lg font-mono bg-white px-4 py-2 rounded border">
              {isRunning ? '...' : getExpectedState()}
            </div>
          </div>

          {/* Execution Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Execution time</label>
            <div className="text-lg font-mono bg-white px-4 py-2 rounded border">
              {isRunning ? '...' : `${result?.executionTime || 0}ms`}
            </div>
          </div>


          {/* Error Message (if any) */}
          {result?.error && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-red-700 mb-2">Error</label>
              <div className="text-sm bg-red-100 text-red-800 p-3 rounded border border-red-200">
                {result.error}
              </div>
            </div>
          )}


        </div>

        {/* Additional Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => executeVerification()}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? 'Running...' : 'Run Again'}
          </button>
        </div>
      </div>
    </div>
  )
} 