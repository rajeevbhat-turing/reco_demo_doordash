"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Play, Search, Clock, Eye, Bug, Info } from 'lucide-react'

interface FlowInfo {
  flowId: string
  description: string
  category: string
  verifier?: string
}

interface VerificationResult {
  passed: boolean | undefined
  error?: string
  executionTime: number
  debugInfo?: {
    cartState?: any
    storeState?: any
    consoleOutput?: string[]
    expectedItems?: string[]
    actualItems?: string[]
  }
}

interface FlowResults {
  [flowId: string]: VerificationResult | null
}

export default function CheckPage() {
  const [flows, setFlows] = useState<FlowInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [runningFlows, setRunningFlows] = useState<Set<string>>(new Set())
  const [flowResults, setFlowResults] = useState<FlowResults>({})
  const [error, setError] = useState<string | null>(null)
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Load all flows on component mount
  useEffect(() => {
    const loadFlows = async () => {
      try {
        const response = await fetch('/api/verify?action=getAll')
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch flows')
          return
        }

        setFlows(data.flows || [])
      } catch (err) {
        setError('Failed to connect to verification service')
      } finally {
        setLoading(false)
      }
    }

    loadFlows()
  }, [])

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

  const handleRunVerification = async (flowId: string) => {
    setRunningFlows(prev => new Set(prev).add(flowId))
    setFlowResults(prev => ({ ...prev, [flowId]: null }))

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
      const response = await fetch(`/api/verify?flowId=${encodeURIComponent(flowId)}&action=execute`)
      const data = await response.json()

      if (!response.ok) {
        setFlowResults(prev => ({ 
          ...prev, 
          [flowId]: { 
            passed: false, 
            error: data.error || 'Failed to get verifier code', 
            executionTime: 0,
            debugInfo: { cartState: stateBefore, consoleOutput }
          }
        }))
        return
      }

      // Execute verifier code in browser context
      let result: boolean | undefined
      try {
        // Create a function from the verifier code and execute it
        const verifierFunction = new Function(data.verifierCode)
        result = verifierFunction()
      } catch (execError) {
        console.error('Verifier execution error:', execError)
        const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
        setFlowResults(prev => ({ 
          ...prev, 
          [flowId]: { 
            passed: false, 
            error: `Verifier execution failed: ${errorMessage}`,
            executionTime: Math.round((performance.now() - startTime) * 100) / 100,
            debugInfo: { cartState: stateBefore, consoleOutput }
          }
        }))
        return
      } finally {
        // Restore console
        console.log = originalConsoleLog
        console.error = originalConsoleError
      }

      const executionTime = performance.now() - startTime
      const stateAfter = captureCurrentState()

      const verificationResult = {
        passed: result,
        executionTime: Math.round(executionTime * 100) / 100,
        debugInfo: {
          cartState: stateBefore,
          consoleOutput: consoleOutput.filter(log => log.includes(`[VERIFIER ${flowId}]`) || log.includes('Verifier error')),
          expectedItems: extractExpectedItems(data.description),
          actualItems: stateBefore.cartItems?.map((item: any) => `${item.itemName} x${item.quantity}`) || []
        }
      }

      setFlowResults(prev => ({ ...prev, [flowId]: verificationResult }))

      // Log result to server
      await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: flowId,
          result: result,
          error: null
        })
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setFlowResults(prev => ({ 
        ...prev, 
        [flowId]: { 
          passed: false, 
          error: `Verification failed: ${errorMessage}`, 
          executionTime: 0,
          debugInfo: { cartState: captureCurrentState(), consoleOutput: [] }
        }
      }))
    } finally {
      setRunningFlows(prev => {
        const newSet = new Set(prev)
        newSet.delete(flowId)
        return newSet
      })
    }
  }

  const extractExpectedItems = (description: string): string[] => {
    const items: string[] = []
    // Extract common patterns from descriptions
    if (description.includes('sweet pretzel')) items.push('sweet pretzel')
    if (description.includes('coffee')) items.push('Coffee')
    if (description.includes('latte')) items.push('Latte')
    return items
  }

  const handleRunAll = async () => {
    for (const flow of filteredFlows) {
      if (!runningFlows.has(flow.flowId)) {
        await handleRunVerification(flow.flowId)
        // Add a small delay between runs to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
  }

  const handleClearResults = () => {
    setFlowResults({})
  }

  const handleClearState = () => {
    try {
      // Clear all localStorage
      localStorage.clear()
      console.log('✅ All localStorage cleared successfully')
      
      // Show success message
      alert('✅ All application state cleared successfully! All verifiers are now ready to run again.')
      
      // Clear flow results since state has changed
      setFlowResults({})
      
      // Force page refresh to reflect cleared state
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error)
      alert(`❌ Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'restaurant-cart': 'bg-orange-100 text-orange-800',
      'grocery-cart': 'bg-green-100 text-green-800',
      'retail-cart': 'bg-blue-100 text-blue-800',
      'pets-cart': 'bg-purple-100 text-purple-800',
      'search': 'bg-yellow-100 text-yellow-800',
      'cart': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getResultStats = () => {
    const results = Object.values(flowResults).filter(r => r !== null)
    const passed = results.filter(r => r?.passed === true).length
    const failed = results.filter(r => r?.passed === false).length
    const undefinedResults = results.filter(r => r?.passed === undefined).length
    return { total: results.length, passed, failed, undefined: undefinedResults }
  }

  const getStatusIcon = (result: VerificationResult | null) => {
    if (!result) return <Clock className="w-5 h-5 text-gray-400" />
    if (result.passed === true) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (result.passed === false) return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertCircle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusText = (result: VerificationResult | null) => {
    if (!result) return 'Not Run'
    if (result.passed === true) return 'Passed'
    if (result.passed === false) return 'Failed'
    return 'Undefined'
  }

  const filteredFlows = flows.filter(flow => {
    if (filterCategory !== 'all' && flow.category !== filterCategory) return false
    if (filterStatus !== 'all') {
      const result = flowResults[flow.flowId]
      if (filterStatus === 'passed' && result?.passed !== true) return false
      if (filterStatus === 'failed' && result?.passed !== false) return false
      if (filterStatus === 'undefined' && result?.passed !== undefined) return false
      if (filterStatus === 'not-run' && result !== null) return false
    }
    return true
  })

  const stats = getResultStats()
  const uniqueCategories = [...new Set(flows.map(f => f.category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 mt-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading flows...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced Verifier Testing Dashboard
            </h1>
            <div className="flex gap-3">
              {stats.total > 0 && (
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span>Tested: {stats.total}/{flows.length}</span>
                  <span className="text-green-600">Passed: {stats.passed}</span>
                  <span className="text-red-600">Failed: {stats.failed}</span>
                  <span className="text-yellow-600">Undefined: {stats.undefined}</span>
                </div>
              )}
              <button
                onClick={handleClearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                disabled={Object.keys(flowResults).length === 0}
              >
                Clear Results
              </button>
              <button
                onClick={handleClearState}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Clear All State
              </button>
              <button
                onClick={handleRunAll}
                disabled={runningFlows.size > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run All Filtered ({filteredFlows.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="undefined">Undefined</option>
                <option value="not-run">Not Run</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredFlows.length} of {flows.length} verifiers
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

          {/* Flow List */}
          <div className="space-y-4">
            {filteredFlows.map((flow) => {
              const isRunning = runningFlows.has(flow.flowId)
              const result = flowResults[flow.flowId]
              const isExpanded = expandedFlow === flow.flowId

              return (
                <div key={flow.flowId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result)}
                        <div>
                          <h3 className="font-medium text-gray-900">{flow.flowId}</h3>
                          <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(flow.category)}`}>
                          {flow.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getStatusText(result)}
                          {result && result.executionTime > 0 && ` (${result.executionTime}ms)`}
                        </span>
                        {result && (
                          <button
                            onClick={() => setExpandedFlow(isExpanded ? null : flow.flowId)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRunVerification(flow.flowId)}
                          disabled={isRunning}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          {isRunning ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Run
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {result?.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Debug Info */}
                  {isExpanded && result?.debugInfo && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cart State */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            Cart State
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md text-xs font-mono">
                            <div><strong>Items in Cart:</strong> {result.debugInfo.cartState?.cartItems?.length || 0}</div>
                            <div><strong>Current Store:</strong> {result.debugInfo.cartState?.currentStore?.name || 'None'}</div>
                            <div><strong>Category:</strong> {result.debugInfo.cartState?.currentCategory || 'None'}</div>
                            {result.debugInfo.cartState?.cartItems?.map((item: any, i: number) => (
                              <div key={i} className="mt-1 pl-4">
                                • {item.itemName} x{item.quantity} (${item.price}) from {item.storeName}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expected vs Actual */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Expected vs Actual
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md text-xs">
                            <div className="mb-2">
                              <strong>Expected Items:</strong>
                              {result.debugInfo.expectedItems?.length ? (
                                <ul className="mt-1 pl-4">
                                  {result.debugInfo.expectedItems.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500"> (extracted from description)</span>
                              )}
                            </div>
                            <div>
                              <strong>Actual Items:</strong>
                              {result.debugInfo.actualItems?.length ? (
                                <ul className="mt-1 pl-4">
                                  {result.debugInfo.actualItems.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500"> (none)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Console Output */}
                        {result.debugInfo.consoleOutput && result.debugInfo.consoleOutput.length > 0 && (
                          <div className="lg:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-2">Console Output</h4>
                            <div className="bg-black text-green-400 p-3 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                              {result.debugInfo.consoleOutput.map((log, i) => (
                                <div key={i}>{log}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredFlows.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No flows match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}