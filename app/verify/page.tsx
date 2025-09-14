"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Play, Loader2, Clock, ChevronRight, ChevronDown } from 'lucide-react'

interface Task {
  task_id: string
  task_description: string
  task_link: string
  verification_link: string
  max_steps: number
  max_wait_time: number
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
    cartState: any
    expectedItems: string[]
    actualItems: string[]
  }
}

export default function VerifyPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [taskResults, setTaskResults] = useState<Record<string, VerificationResult | null>>({})
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  // Load tasks from production_tasks.csv
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // For now, we'll use the tasks from flow-verifiers.json
        // In a real implementation, you'd parse the CSV file
        const response = await fetch('/api/verify?action=getAll')
        const data = await response.json()
        
        if (response.ok && data.flows) {
          // Convert flow data to task format
          const taskList: Task[] = data.flows.map((flow: any, index: number) => ({
            task_id: flow.flowId,
            task_description: flow.description,
            task_link: 'https://turing-dashdoor-clone.vercel.app/',
            verification_link: `https://turing-dashdoor-clone.vercel.app/verify/${flow.flowId}`,
            max_steps: 100,
            max_wait_time: 1800
          }))
          setTasks(taskList)
        } else {
          // Fallback: create some sample tasks based on your CSV
          const sampleTasks: Task[] = [
            {
              task_id: 'clear-cart',
              task_description: 'Add 3 Items and Clear the Cart',
              task_link: 'https://turing-dashdoor-clone.vercel.app/',
              verification_link: 'https://turing-dashdoor-clone.vercel.app/verify/clear-cart',
              max_steps: 100,
              max_wait_time: 1800
            },
            {
              task_id: 'add-milk-from-safeway',
              task_description: 'Search for Safeway in the Grocery section and add a gallon of milk to the cart',
              task_link: 'https://turing-dashdoor-clone.vercel.app/',
              verification_link: 'https://turing-dashdoor-clone.vercel.app/verify/add-milk-from-safeway',
              max_steps: 100,
              max_wait_time: 1800
            },
            {
              task_id: 'add-sweet-pretzel',
              task_description: 'Add a sweet pretzel from Jamba Juice to the cart',
              task_link: 'https://turing-dashdoor-clone.vercel.app/',
              verification_link: 'https://turing-dashdoor-clone.vercel.app/verify/add-sweet-pretzel',
              max_steps: 100,
              max_wait_time: 1800
            }
          ]
          setTasks(sampleTasks)
        }
      } catch (err) {
        setError('Failed to load tasks')
        console.error('Error loading tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
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

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const clearResults = () => {
    try {
      // Clear all localStorage
      localStorage.clear()
      console.log('✅ All localStorage cleared successfully')
      
      // Clear task results
      setTaskResults({})
      
      // Show success message
      alert('✅ All application state cleared successfully! All verifiers are now ready to run again.')
      
      // Force page refresh to reflect cleared state
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error)
      alert(`❌ Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleRunTask = async (taskId: string) => {
    setRunningTasks(prev => new Set(prev).add(taskId))
    setTaskResults(prev => ({ ...prev, [taskId]: null }))

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
        setTaskResults(prev => ({ ...prev, [taskId]: failureResult }))
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
        setTaskResults(prev => ({ ...prev, [taskId]: errorResult }))
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

      setTaskResults(prev => ({ ...prev, [taskId]: verificationResult_final }))

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      const errorResult = {
        flowId: taskId,
        passed: false,
        error: `Verification failed: ${errorMessage}`,
        executionTime: 0,
        consoleOutput: [],
        description: 'Unknown task',
        category: 'unknown',
        debugInfo: {
          cartState: captureCurrentState(),
          expectedItems: [],
          actualItems: []
        }
      }
      setTaskResults(prev => ({ ...prev, [taskId]: errorResult }))
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
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
    if (description.includes('starbucks')) items.push('Starbucks store')
    return items
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 mt-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Task Verifier Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 max-w-md">
                <p>Clear the results before starting a new task. This will also clear local storage and reload this page, which will get the verifier ready for the next run.</p>
              </div>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Clear Results
              </button>
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

          {/* Task List */}
          <div className="space-y-4">
            {tasks.map((task, index) => {
              const isExpanded = expandedTasks.has(task.task_id)
              const result = taskResults[task.task_id]
              const isRunning = runningTasks.has(task.task_id)

              return (
                <div key={task.task_id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-900">#{index + 1}</div>
                        {getStatusIcon(result)}
                        <div>
                          <div className="font-medium text-gray-900">
                            Prompt ID: {task.task_id}
                          </div>
                          <button
                            onClick={() => toggleTaskExpansion(task.task_id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-1"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            Prompt
                          </button>
                          <div className="text-sm text-gray-500 mt-1">
                            {getStatusText(result)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRunTask(task.task_id)}
                        disabled={isRunning}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
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

                    {/* Expanded Prompt Section */}
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-md">
                        <p className="text-gray-900 leading-relaxed">{task.task_description}</p>
                      </div>
                    )}

                    {/* Result Display */}
                    {result && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Result:</h4>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            result.passed === true ? 'bg-green-100 text-green-800' :
                            result.passed === false ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStatusText(result)}
                          </span>
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mb-2">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Execution time: {result.executionTime}ms
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {tasks.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No tasks available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 