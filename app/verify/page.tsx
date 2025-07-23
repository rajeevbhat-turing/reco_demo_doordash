"use client"

import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Play, Loader2 } from 'lucide-react'

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

export default function VerifyPage() {
  const [taskId, setTaskId] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => generateSessionId())

  // Generate a unique session ID for this browser session
  function generateSessionId(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
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

  const handleRunVerification = async () => {
    if (!taskId.trim()) {
      setError('Please enter a task ID')
      return
    }

    setIsRunning(true)
    setError(null)
    setResult(null)

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
        
        // Log the execution
        await logExecution(failureResult)
        return
      }

      // Execute verifier code in browser context
      let verificationResult: boolean | undefined
      try {
        // Create a function from the verifier code and execute it
        const verifierFunction = new Function(data.verifierCode)
        verificationResult = verifierFunction()
      } catch (execError) {
        console.error('Verifier execution error:', execError)
        const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
        const errorResult = {
          flowId: taskId,
          passed: false,
          error: `Verifier execution failed: ${errorMessage}`,
          executionTime: Math.round((performance.now() - startTime) * 100) / 100,
          consoleOutput,
          description: data.description || 'Unknown task',
          category: 'unknown',
          debugInfo: {
            cartState: stateBefore,
            expectedItems: [],
            actualItems: stateBefore.cartItems?.map((item: any) => `${item.itemName || item.name} x${item.quantity}`) || []
          }
        }
        setResult(errorResult)
        
        // Log the execution
        await logExecution(errorResult)
        return
      } finally {
        // Restore console
        console.log = originalConsoleLog
        console.error = originalConsoleError
      }

      const executionTime = performance.now() - startTime

      const verificationResult_final = {
        flowId: taskId,
        passed: verificationResult,
        error: null,
        executionTime: Math.round(executionTime * 100) / 100,
        consoleOutput: consoleOutput.filter(log => 
          log.includes(`[VERIFIER ${taskId}]`) || log.includes('Verifier error')
        ),
        description: data.description || 'Unknown task',
        category: 'unknown',
        debugInfo: {
          cartState: stateBefore,
          expectedItems: extractExpectedItems(data.description || ''),
          actualItems: stateBefore.cartItems?.map((item: any) => `${item.itemName || item.name} x${item.quantity}`) || []
        }
      }

      setResult(verificationResult_final)
      
      // Log the execution
      await logExecution(verificationResult_final)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Verification failed: ${errorMessage}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Function to log execution to server
  const logExecution = async (result: VerificationResult) => {
    try {
      await fetch('/api/log-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          taskId: result.flowId,
          passed: result.passed,
          executionTime: result.executionTime,
          error: result.error,
          description: result.description,
          cartItemCount: result.debugInfo?.actualItems?.length || 0,
          currentStore: result.debugInfo?.cartState?.currentStore?.name || 'None',
          userAgent: navigator.userAgent,
          url: window.location.href,
          sessionId: sessionId
        })
      })
    } catch (logError) {
      console.warn('Failed to log execution:', logError)
    }
  }

  const extractExpectedItems = (description: string): string[] => {
    const items: string[] = []
    // Extract common patterns from descriptions
    if (description.includes('sweet pretzel')) items.push('sweet pretzel')
    if (description.includes('coffee')) items.push('Coffee')
    if (description.includes('latte')) items.push('Latte')
    if (description.includes('starbucks')) items.push('Starbucks store')
    return items
  }

  const getStatusIcon = (result: VerificationResult | null) => {
    if (!result) return null
    if (result.passed === true) return <CheckCircle className="w-6 h-6 text-green-500" />
    if (result.passed === false) return <XCircle className="w-6 h-6 text-red-500" />
    return <AlertCircle className="w-6 h-6 text-yellow-500" />
  }

  const getStatusText = (result: VerificationResult | null) => {
    if (!result) return ''
    if (result.passed === true) return 'PASSED'
    if (result.passed === false) return 'FAILED'
    return 'UNDEFINED'
  }

  const getStatusColor = (result: VerificationResult | null) => {
    if (!result) return ''
    if (result.passed === true) return 'text-green-600 bg-green-50'
    if (result.passed === false) return 'text-red-600 bg-red-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Task Verifier
            </h1>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-2">
                  Task ID
                </label>
                <input
                  id="taskId"
                  type="text"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  placeholder="Agent to enter task ID here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleRunVerification()}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRunVerification}
                  disabled={isRunning || !taskId.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`p-6 ${getStatusColor(result)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result)}
                    <div>
                      <h2 className="text-xl font-bold">{result.flowId}</h2>
                      <p className="text-sm opacity-90 mt-1">{result.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{getStatusText(result)}</div>
                    <div className="text-sm opacity-75">{result.executionTime}ms</div>
                  </div>
                </div>

                {result.error && (
                  <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md">
                    <p className="text-sm font-medium">Error Details:</p>
                    <p className="text-sm mt-1">{result.error}</p>
                  </div>
                )}
              </div>

              {/* Debug Information */}
              {result.debugInfo && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Information</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current State */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current State</h4>
                      <div className="bg-white p-4 rounded-md text-sm space-y-2">
                        <div><strong>Cart Items:</strong> {result.debugInfo.actualItems.length}</div>
                        <div><strong>Current Store:</strong> {result.debugInfo.cartState?.currentStore?.name || 'None'}</div>
                        <div><strong>Category:</strong> {result.debugInfo.cartState?.currentCategory || 'None'}</div>
                        {result.debugInfo.actualItems.length > 0 && (
                          <div>
                            <strong>Items:</strong>
                            <ul className="mt-1 pl-4 space-y-1">
                              {result.debugInfo.actualItems.map((item, i) => (
                                <li key={i} className="text-gray-600">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expected vs Actual */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Expected vs Actual</h4>
                      <div className="bg-white p-4 rounded-md text-sm space-y-3">
                        <div>
                          <strong>Expected:</strong>
                          {result.debugInfo.expectedItems.length > 0 ? (
                            <ul className="mt-1 pl-4 space-y-1">
                              {result.debugInfo.expectedItems.map((item, i) => (
                                <li key={i} className="text-gray-600">• {item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 ml-2">(auto-detected from description)</span>
                          )}
                        </div>
                        <div>
                          <strong>Actual:</strong>
                          {result.debugInfo.actualItems.length > 0 ? (
                            <ul className="mt-1 pl-4 space-y-1">
                              {result.debugInfo.actualItems.map((item, i) => (
                                <li key={i} className="text-gray-600">• {item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 ml-2">(none)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Console Output */}
                  {result.consoleOutput && result.consoleOutput.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-2">Console Output</h4>
                      <div className="bg-black text-green-400 p-4 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                        {result.consoleOutput.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  )
} 