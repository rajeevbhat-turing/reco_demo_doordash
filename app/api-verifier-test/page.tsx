"use client"

import { useState } from 'react'
import { 
  verifyCurrentTask, 
  verifyTaskWithFile, 
  getAvailableTasks, 
  openLocalStorageDownload,
  getCurlCommand,
  downloadLocalStorage,
  type VerificationResult 
} from '@/utils/api-verifier'

export default function ApiVerifierTestPage() {
  const [tasks, setTasks] = useState<Array<{flowId: string; description: string; category: string}>>([])
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStorageFile, setLocalStorageFile] = useState<File | null>(null)

  const loadTasks = async () => {
    try {
      setLoading(true)
      const availableTasks = await getAvailableTasks()
      setTasks(availableTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCurrent = async () => {
    if (!selectedTask) {
      setError('Please select a task first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const verificationResult = await verifyCurrentTask(selectedTask)
      setResult(verificationResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyWithFile = async () => {
    if (!selectedTask) {
      setError('Please select a task first')
      return
    }

    if (!localStorageFile) {
      setError('Please select a localStorage file first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const verificationResult = await verifyTaskWithFile(selectedTask, localStorageFile)
      setResult(verificationResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLocalStorageFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            API-Based Verifier Test
          </h1>

          {/* Load Tasks Button */}
          <div className="mb-6">
            <button
              onClick={loadTasks}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Available Tasks'}
            </button>
          </div>

          {/* Task Selection */}
          {tasks.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task:
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Choose a task...</option>
                {tasks.map((task) => (
                  <option key={task.flowId} value={task.flowId}>
                    {task.description} ({task.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Verification Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Current localStorage verification */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Verify with Current localStorage
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Uses the current browser's localStorage data
              </p>
              <button
                onClick={handleVerifyCurrent}
                disabled={!selectedTask || loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Current State'}
              </button>
            </div>

            {/* File upload verification */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Verify with File Upload
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a localStorage.json file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="mb-3 w-full"
              />
              <button
                onClick={handleVerifyWithFile}
                disabled={!selectedTask || !localStorageFile || loading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify with File'}
              </button>
            </div>
          </div>

          {/* localStorage Download Tools */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              localStorage Download Tools
            </h3>
            <div className="flex gap-3">
              <button
                onClick={downloadLocalStorage}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Download localStorage.json
              </button>
              <button
                onClick={openLocalStorageDownload}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Open Download Page
              </button>
            </div>
          </div>

          {/* cURL Command */}
          {selectedTask && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                cURL Command
              </h3>
              <div className="bg-black text-green-400 p-3 rounded-md text-sm font-mono overflow-x-auto">
                {getCurlCommand(selectedTask, '/path/to/localStorage.json')}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Verification Result
              </h3>
              <div className="space-y-2">
                <div>
                  <strong>Task ID:</strong> {result.taskId}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    result.passed === true ? 'bg-green-100 text-green-800' :
                    result.passed === false ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.passed === true ? 'PASSED' : 
                     result.passed === false ? 'FAILED' : 'UNDEFINED'}
                  </span>
                </div>
                <div>
                  <strong>Execution Time:</strong> {result.executionTime}ms
                </div>
                <div>
                  <strong>Description:</strong> {result.description}
                </div>
                <div>
                  <strong>Category:</strong> {result.category}
                </div>
                {result.error && (
                  <div>
                    <strong>Error:</strong> 
                    <span className="text-red-600 ml-2">{result.error}</span>
                  </div>
                )}
                {result.consoleOutput && result.consoleOutput.length > 0 && (
                  <div>
                    <strong>Console Output:</strong>
                    <div className="mt-2 bg-black text-green-400 p-3 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                      {result.consoleOutput.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
