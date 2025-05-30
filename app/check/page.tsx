"use client"

import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Play, Search } from 'lucide-react'

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

export default function CheckPage() {
  const [flowId, setFlowId] = useState('')
  const [flowInfo, setFlowInfo] = useState<FlowInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLookupFlow = async () => {
    if (!flowId.trim()) return

    setLoading(true)
    setError(null)
    setFlowInfo(null)
    setVerificationResult(null)

    try {
      const response = await fetch(`/api/verify?flowId=${encodeURIComponent(flowId.trim())}&action=get`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch flow information')
        return
      }

      setFlowInfo(data)
    } catch (err) {
      setError('Failed to connect to verification service')
    } finally {
      setLoading(false)
    }
  }

  const handleRunVerification = async () => {
    if (!flowInfo) return

    setLoading(true)
    setVerificationResult(null)
    setError(null)

    try {
      const startTime = performance.now()
      
      // Get verifier code from API
      const response = await fetch(`/api/verify?flowId=${encodeURIComponent(flowInfo.flowId)}&action=execute`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to get verifier code')
        return
      }

      // Execute verifier code in browser context
      let result: boolean
      try {
        // First, let's check what's actually in localStorage for debugging
        const cartData = localStorage.getItem('multicategory-cart')
        console.log('Cart data available:', !!cartData)
        if (cartData) {
          try {
            const parsedData = JSON.parse(cartData)
            console.log('Parsed cart data:', parsedData)
            console.log('State available:', !!parsedData.state)
            if (parsedData.state) {
              console.log('Current store:', parsedData.state.currentStore)
              console.log('Current category:', parsedData.state.currentCategory)
            }
          } catch (parseError) {
            console.log('Failed to parse cart data:', parseError)
          }
        }

        // Create a function from the verifier code and execute it
        const verifierFunction = new Function(data.verifierCode)
        result = verifierFunction()
        console.log('Verifier result:', result)
      } catch (execError) {
        console.error('Verifier execution error:', execError)
        setError(`Verifier execution failed: ${execError instanceof Error ? execError.message : 'Unknown error'}`)
        return
      }

      const executionTime = performance.now() - startTime

      const verificationResult = {
        passed: result,
        executionTime: Math.round(executionTime * 100) / 100 // Round to 2 decimal places
      }

      setVerificationResult(verificationResult)

      // Log result to server
      await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: flowInfo.flowId,
          result: result,
          error: null
        })
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Verification failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFlowId('')
    setFlowInfo(null)
    setVerificationResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Flow Verifier
          </h1>

          {/* Flow ID Input */}
          <div className="mb-6">
            <label htmlFor="flowId" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Flow ID to Verify
            </label>
            <div className="flex gap-3">
              <input
                id="flowId"
                type="text"
                value={flowId}
                onChange={(e) => setFlowId(e.target.value)}
                placeholder="e.g., search-starbucks"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleLookupFlow()}
                disabled={loading}
              />
              <button
                onClick={handleLookupFlow}
                disabled={loading || !flowId.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Lookup
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

          {/* Flow Information */}
          {flowInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Flow Found</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">ID:</span> {flowInfo.flowId}</p>
                <p><span className="font-medium">Description:</span> {flowInfo.description}</p>
                <p><span className="font-medium">Category:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {flowInfo.category}
                  </span>
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700 mb-3">
                  Ready to run verification for this flow?
                </p>
                <button
                  onClick={handleRunVerification}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Running...' : 'Run Verification'}
                </button>
              </div>
            </div>
          )}

          {/* Verification Results */}
          {verificationResult && (
            <div className={`mb-6 p-4 rounded-md border ${
              verificationResult.passed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {verificationResult.passed ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    verificationResult.passed ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {verificationResult.passed ? 'Verification Passed ✓' : 'Verification Failed ✗'}
                  </h3>
                  <div className="mt-2 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Flow ID:</span> {flowInfo?.flowId}
                    </p>
                    <p>
                      <span className="font-medium">Execution Time:</span> {verificationResult.executionTime}ms
                    </p>
                    <p>
                      <span className="font-medium">Result:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        verificationResult.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {verificationResult.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(flowInfo || verificationResult || error) && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Verify Another Flow
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 