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
      return {
        cartItems: cartState.state?.items || [],
        currentStore: cartState.state?.currentStore || null,
        searchResults: cartState.state?.searchResults || [],
        lastSearchInfo: cartState.state?.lastSearchInfo || null,
        lastClearInfo: cartState.state?.lastClearInfo || null,
        lastRemovalInfo: cartState.state?.lastRemovalInfo || null,
        currentCategory: cartState.state?.currentCategory || null,
        verifierConsumed: cartState.state?.verifierConsumed || false,
        searchVerifierConsumed: cartState.state?.searchVerifierConsumed || false,
        removalVerifierConsumed: cartState.state?.removalVerifierConsumed || false
      }
    } catch {
      return { error: 'Failed to parse cart state' }
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
            expectedItems: [],
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
          expectedItems: [],
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
        category: 'unknown'
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
          <h1 className="text-3xl font-bold text-gray-900">Task Verification</h1>
          <p className="text-gray-600 mt-2">Automatic execution results for task: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{taskId}</code></p>
        </div>

        {/* Status Card */}
        <div className={`border rounded-lg p-8 text-center ${getBgColor()}`}>
          {/* Task ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Task ID</label>
            <div className="text-lg font-mono bg-white px-4 py-2 rounded border">
              {taskId}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Status</label>
            <div className="flex items-center justify-center mb-4">
              {getStatusIcon()}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>

          {/* Execution Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Execution time</label>
            <div className="text-lg bg-white px-4 py-2 rounded border">
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

          {/* Description */}
          {result?.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="text-sm bg-white text-gray-800 p-3 rounded border">
                {result.description}
              </div>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => executeVerification()}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? 'Running...' : 'Run Again'}
          </button>
          <button
            onClick={() => router.push('/verify')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Manual Verify
          </button>
        </div>
      </div>
    </div>
  )
} 