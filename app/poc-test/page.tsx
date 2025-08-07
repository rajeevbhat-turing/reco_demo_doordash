'use client'

import { useState, useEffect } from 'react'

export default function POCTestPage() {
  const [sessionId, setSessionId] = useState('')
  const [taskId, setTaskId] = useState('search-starbucks')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    // Get current session ID from sessionStorage
    const currentSessionId = sessionStorage.getItem('doordash-session-id') || ''
    setSessionId(currentSessionId)
  }, [])

  const runPOCTest = async () => {
    if (!sessionId) {
      alert('Please enter a session ID')
      return
    }

    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/verify-by-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, sessionId })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Test error:', error)
      setResult({ error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testStateSync = async () => {
    if (!sessionId) return
    
    try {
      // Manually sync current cart state
      const cartState = JSON.parse(localStorage.getItem('multicategory-cart') || '{}')
      
      const response = await fetch('/api/state-auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          state: cartState.state || {},
          timestamp: Date.now()
        })
      })

      const result = await response.json()
      alert(`State sync: ${result.synced ? 'Success' : 'Failed'}`)
         } catch (error) {
       alert(`State sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const checkSyncStatus = async () => {
    if (!sessionId) return
    
    try {
      const response = await fetch(`/api/state-auto-sync?sessionId=${sessionId}`)
      const data = await response.json()
      
      alert(`Session Status:
Has State: ${data.hasState}
Last Sync: ${data.lastSync || 'Never'}
Cart Items: ${data.cartItems}
Current Store: ${data.currentStore || 'None'}`)
         } catch (error) {
       alert(`Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">Database State POC Test</h1>
      
      {/* Session Info */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <div className="text-sm text-gray-600 mb-2">Current Session ID:</div>
        <div className="font-mono text-sm bg-white p-2 rounded border">
          {sessionId || 'No session found - navigate to main app first'}
        </div>
      </div>

      {/* Manual Session ID Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Session ID (auto-filled from current session)
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter session ID manually if needed"
            className="w-full border rounded px-3 py-2 font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Task ID</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="search-starbucks">search-starbucks</option>
            <option value="search-target">search-target</option>
            <option value="add-sweet-pretzel">add-sweet-pretzel</option>
            <option value="clear-cart">clear-cart</option>
            <option value="find-pizza-restaurants">find-pizza-restaurants</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={testStateSync}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manual State Sync
        </button>
        
        <button
          onClick={checkSyncStatus}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Check Sync Status
        </button>
        
        <button
          onClick={runPOCTest}
          disabled={loading || !sessionId}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-600"
        >
          {loading ? 'Testing...' : 'Run Verification Test'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Verification Result:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-3 rounded ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <div className="font-medium">
                {result.passed ? '✅ PASSED' : '❌ FAILED'}
              </div>
              <div className="text-sm text-gray-600">
                {result.executionTime}ms execution time
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="font-medium">Task: {result.taskId}</div>
              <div className="text-sm text-gray-600">
                {result.description}
              </div>
            </div>
          </div>

          {result.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <div className="font-medium text-red-800">Error:</div>
              <div className="text-sm text-red-700">{result.error}</div>
            </div>
          )}

          {result.stateSnapshot && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <div className="font-medium text-blue-800 mb-2">State Snapshot:</div>
              <div className="text-sm space-y-1">
                <div>Cart Items: {result.stateSnapshot.cartItems}</div>
                <div>Current Store: {result.stateSnapshot.currentStore || 'None'}</div>
                <div>Last Search: {result.stateSnapshot.lastSearchTerm || 'None'}</div>
                <div>Category: {result.stateSnapshot.currentCategory || 'None'}</div>
              </div>
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-gray-700">
              Raw Response Data
            </summary>
            <pre className="text-xs bg-gray-100 p-3 mt-2 overflow-auto rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded p-6">
        <h3 className="font-medium text-blue-800 mb-3">POC Test Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li>
            <strong>Navigate to main app:</strong> Go to{' '}
            <a href="/" className="underline" target="_blank">http://localhost:3000</a>
            {' '}and perform actions (search, navigate, add items)
          </li>
          <li>
            <strong>Manual sync (for now):</strong> Click "Manual State Sync" to save current state to database
          </li>
          <li>
            <strong>Verify completion:</strong> Select a task and click "Run Verification Test"
          </li>
          <li>
            <strong>Check results:</strong> GREEN = task completed successfully, RED = task not completed
          </li>
        </ol>
        
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="font-medium text-gray-800 mb-1">API Endpoint for External Use:</div>
          <code className="text-sm bg-gray-100 p-1 rounded">
            POST /api/verify-by-session
          </code>
          <pre className="text-xs mt-2 text-gray-600">
{`{
  "taskId": "search-starbucks",
  "sessionId": "${sessionId || 'your-session-id'}"
}`}
          </pre>
        </div>
      </div>
    </div>
  )
} 