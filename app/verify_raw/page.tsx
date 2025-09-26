"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

export default function VerifyRawPage() {
  const [taskId, setTaskId] = useState('add-cooler-bag')
  const [localStorageData, setLocalStorageData] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRawJson, setShowRawJson] = useState(false)
  const [modelResponse, setModelResponse] = useState('')
  const [rawJsonBefore, setRawJsonBefore] = useState<any>(null)
  const [rawJsonAfter, setRawJsonAfter] = useState<any>(null)

  const sampleData = {
    'add-cooler-bag': {
      "multicategory-cart": JSON.stringify({
        "state": {
          "items": [{"id": "blue-cooler-bag-1758305873707-r135p6e1i", "restaurantId": "boichik-bagels", "itemName": "Blue Cooler Bag", "price": "$14.40", "quantity": 1, "category": "restaurant"}],
          "currentStore": {"name": "Boichik Bagels", "id": "boichik-bagels"},
          "currentCategory": "restaurant",
          "verifierConsumed": false
        }
      })
    },
    'clear-cart': {
      "multicategory-cart": JSON.stringify({
        "state": {
          "items": [],
          "lastClearInfo": {"itemsBeforeClear": 3, "timestamp": Date.now()},
          "verifierConsumed": false
        }
      })
    },
    'compare-price-deltas': {
      "philz-coffee": JSON.stringify({
        "mission-cold-brew": {
          "regular-price": 5.25,
          "value-combo-price": 4.50,
          "price-delta": 0.75
        }
      }),
      "starbucks": JSON.stringify({
        "cappuccino": {
          "regular-price": 4.95,
          "value-combo-price": 4.20,
          "price-delta": 0.75
        }
      })
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let data
      if (localStorageData.trim()) {
        data = JSON.parse(localStorageData)
      } else {
        data = sampleData[taskId as keyof typeof sampleData] || {}
      }

      const requestBody: any = {
        taskId,
        localStorage: data
      }

      // Add model_response if provided
      if (modelResponse.trim()) {
        requestBody.model_response = modelResponse.trim()
      }

      const response = await fetch('/api/verify_raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const resultData = await response.json()
      setResult(resultData)
      setRawJsonAfter(resultData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    const sample = sampleData[taskId as keyof typeof sampleData]
    if (sample) {
      setLocalStorageData(JSON.stringify(sample, null, 2))
    }
  }

  const getRawJsonBefore = async () => {
    try {
      setLoading(true)
      setError('')

      let data
      if (localStorageData.trim()) {
        data = JSON.parse(localStorageData)
      } else {
        data = sampleData[taskId as keyof typeof sampleData] || {}
      }

      const requestBody: any = {
        taskId,
        localStorage: data
      }

      // Add model_response if provided
      if (modelResponse.trim()) {
        requestBody.model_response = modelResponse.trim()
      }

      const response = await fetch('/api/verify_raw/raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const rawJson = await response.json()
      setRawJsonBefore(rawJson)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatRawJsonResult = (result: any) => {
    if (!result || !result.assertions) return null

    const formattedResult: any = {
      taskId: result.taskId,
      description: result.description,
      assertions: result.assertions.map((assertion: any) => {
        let actualValue = assertion.actual
        
        // For ARRAY_LENGTH operator, show the actual length as a number
        if (assertion.operator === 'ARRAY_LENGTH' && Array.isArray(assertion.actual)) {
          actualValue = assertion.actual.length
        }
        
        return {
          operator: assertion.operator,
          path: assertion.path,
          expected: assertion.expected,
          actual: actualValue,
          result: assertion.result,
          error: assertion.error || null
        }
      })
    }

    // Add type field if it exists in the verifier definition
    if (result.type) {
      formattedResult.type = result.type
    }

    // Add rubric if it exists in the verifier definition
    if (result.rubric) {
      formattedResult.rubric = result.rubric
    }

    // Rubric evaluation results are now embedded in the rubric itself

    return formattedResult
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Declarative Verifier Raw Test</CardTitle>
          <CardDescription>
            Test the new declarative verifier system. This endpoint shows actual vs expected values for each assertion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="e.g., add-cooler-bag"
              />
            </div>
            <div className="space-y-2">
              <Label>Sample Data</Label>
              <Button onClick={loadSampleData} variant="outline" className="w-full">
                Load Sample Data
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="localStorage">LocalStorage Data (JSON)</Label>
            <Textarea
              id="localStorage"
              value={localStorageData}
              onChange={(e) => setLocalStorageData(e.target.value)}
              placeholder="Enter localStorage data as JSON..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelResponse">Model Response (Optional - for response-dependent tasks)</Label>
            <Textarea
              id="modelResponse"
              value={modelResponse}
              onChange={(e) => setModelResponse(e.target.value)}
              placeholder="Enter the model's response for evaluation..."
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Button onClick={getRawJsonBefore} disabled={loading} variant="outline" className="w-full">
              {loading ? 'Loading...' : 'Get Raw JSON (Before)'}
            </Button>
            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test Verifier (After)'}
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 font-medium">Error:</p>
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}

          {rawJsonBefore && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Raw JSON (Before Evaluation)</CardTitle>
                <CardDescription>Task definition and rubric structure before running assertions</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
                  {JSON.stringify(rawJsonBefore, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {rawJsonAfter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Raw JSON (After Evaluation)</CardTitle>
                <CardDescription>Task results with actual values and pass/fail status</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
                  {JSON.stringify(rawJsonAfter, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Results for: {result.taskId}
                  <Badge variant={result.overall?.result === 'pass' ? 'default' : 'destructive'}>
                    {result.overall?.result === 'pass' ? 'PASS' : 'FAIL'}
                  </Badge>
                  <Badge variant="outline">
                    {result.overall?.passed_tests || 0}/{result.overall?.total_tests || 0} tests passed
                  </Badge>
                </CardTitle>
                <CardDescription>{result.description}</CardDescription>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="raw-json-toggle"
                    checked={showRawJson}
                    onCheckedChange={setShowRawJson}
                  />
                  <Label htmlFor="raw-json-toggle">Show Raw JSON</Label>
                </div>
              </CardHeader>
              <CardContent>
                {showRawJson ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Raw JSON Result (Spec Format)</h4>
                      <pre className="text-sm font-mono bg-white p-3 rounded border overflow-auto max-h-96">
                        {JSON.stringify(formatRawJsonResult(result), null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.assertions?.map((assertion: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-gray-600">Assertion {index + 1}</h4>
                              <p className="text-sm">
                                <strong>Operator:</strong> {assertion.operator}
                              </p>
                              <p className="text-sm">
                                <strong>Path:</strong> {JSON.stringify(assertion.path)}
                              </p>
                              <p className="text-sm">
                                <strong>Expected:</strong> {JSON.stringify(assertion.expected)}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-600">Result</h4>
                              <p className="text-sm">
                                <strong>Actual:</strong> {JSON.stringify(assertion.actual)}
                              </p>
                              <Badge 
                                variant={assertion.result === 'pass' ? 'default' : 'destructive'}
                              >
                                {assertion.result.toUpperCase()}
                              </Badge>
                              {assertion.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Error:</strong> {assertion.error}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Rubric Evaluation Results */}
                    {result.rubric?.overall && (
                      <Card className="border-l-4 border-l-green-200">
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-sm text-gray-600 mb-4">Rubric Evaluation Results</h4>
                          
                          <div className="space-y-4">
                            {/* Overall Results */}
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={result.rubric.overall?.result === 'pass' ? 'default' : 'destructive'}>
                                  {result.rubric.overall?.result?.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {result.rubric.overall?.passed_tests || 0}/{result.rubric.overall?.total_tests || 0} tests passed
                                </span>
                                <span className="text-xs text-gray-500">
                                  (Score: {result.rubric.overall?.score?.toFixed(2)})
                                </span>
                              </div>
                            </div>

                            {/* Individual Criteria */}
                            <div className="space-y-2">
                              {result.rubric.criteria?.map((criterion: any, index: number) => (
                                <div key={index} className="border rounded p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={criterion.result === 'pass' ? 'default' : 'destructive'}>
                                      {criterion.result?.toUpperCase()}
                                    </Badge>
                                    <span className="font-medium text-sm">{criterion.name}</span>
                                    <span className="text-xs text-gray-500">(weight: {criterion.weight || 0})</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">{criterion.description}</p>
                                  {criterion.error ? (
                                    <p className="text-xs text-red-600">Error: {criterion.error}</p>
                                  ) : (
                                    <div className="text-xs">
                                      <p><strong>Expected:</strong> {JSON.stringify(criterion.expected)}</p>
                                      <p><strong>Actual:</strong> {JSON.stringify(criterion.actual)}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Rubric Evaluation Error */}
                    {result.rubric?.evaluation_error && (
                      <Card className="border-l-4 border-l-red-200">
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-sm text-gray-600 mb-4">Rubric Evaluation Error</h4>
                          <div className="text-red-600">
                            <strong>Error:</strong> {result.rubric.evaluation_error}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
