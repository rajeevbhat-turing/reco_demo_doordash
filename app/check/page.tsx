"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Play, Search, Clock } from 'lucide-react'

interface FlowInfo {
  flowId: string
  description: string
  category: string
  verifier?: string
}

interface VerificationResult {
  passed: boolean
  error?: string
  executionTime: number
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

  const handleRunVerification = async (flowId: string) => {
    setRunningFlows(prev => new Set(prev).add(flowId))
    setFlowResults(prev => ({ ...prev, [flowId]: null }))

    try {
      const startTime = performance.now()
      
      // Get verifier code from API
      const response = await fetch(`/api/verify?flowId=${encodeURIComponent(flowId)}&action=execute`)
      const data = await response.json()

      if (!response.ok) {
        setFlowResults(prev => ({ 
          ...prev, 
          [flowId]: { passed: false, error: data.error || 'Failed to get verifier code', executionTime: 0 }
        }))
        return
      }

      // Execute verifier code in browser context
      let result: boolean
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
            executionTime: Math.round((performance.now() - startTime) * 100) / 100
          }
        }))
        return
      }

      const executionTime = performance.now() - startTime

      const verificationResult = {
        passed: result,
        executionTime: Math.round(executionTime * 100) / 100
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
        [flowId]: { passed: false, error: `Verification failed: ${errorMessage}`, executionTime: 0 }
      }))
    } finally {
      setRunningFlows(prev => {
        const newSet = new Set(prev)
        newSet.delete(flowId)
        return newSet
      })
    }
  }

  const handleRunAll = async () => {
    for (const flow of flows) {
      if (!runningFlows.has(flow.flowId)) {
        await handleRunVerification(flow.flowId)
        // Add a small delay between runs to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  const handleClearResults = () => {
    setFlowResults({})
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
    const passed = results.filter(r => r?.passed).length
    const failed = results.filter(r => r && !r.passed).length
    return { total: results.length, passed, failed }
  }

  const stats = getResultStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 mt-14">
        <div className="max-w-4xl mx-auto px-4">
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Flow Verifier Dashboard
            </h1>
            <div className="flex gap-3">
              {stats.total > 0 && (
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span>Tested: {stats.total}/{flows.length}</span>
                  <span className="text-green-600">Passed: {stats.passed}</span>
                  <span className="text-red-600">Failed: {stats.failed}</span>
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
                onClick={handleRunAll}
                disabled={runningFlows.size > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run All
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Flows List */}
          <div className="space-y-4">
            {flows.map((flow) => {
              const isRunning = runningFlows.has(flow.flowId)
              const result = flowResults[flow.flowId]

              return (
                <div
                  key={flow.flowId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {flow.flowId}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(flow.category)}`}>
                          {flow.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{flow.description}</p>
                      
                      {result?.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {result.error}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Result Display */}
                      {result && !isRunning && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                          result.passed 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {result.passed ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-xs opacity-75">
                            {result.executionTime}ms
                          </span>
                        </div>
                      )}

                      {/* Loading State */}
                      {isRunning && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Running...</span>
                        </div>
                      )}

                      {/* Run Button */}
                      <button
                        onClick={() => handleRunVerification(flow.flowId)}
                        disabled={isRunning}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Run
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {flows.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No flows found. Make sure your verifiers are properly configured.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 