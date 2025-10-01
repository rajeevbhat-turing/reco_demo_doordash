'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface SingleAssertion {
  title: string;
  operator: string;
  path: string;
  expected: any;
  options?: Record<string, any>;
  status?: 'pending' | 'running' | 'passed' | 'failed';
  actual?: any;
  error?: string;
  executionTime?: number;
  score?: number;
  details?: {
    criteria: Record<string, number>;
    overall: number;
    hard_rules_triggered: string[];
    rationale: string;
  };
}
interface Assertion {
  prompt: string;
  assertions: SingleAssertion[];
}

interface VerifierModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface GetExpectedStateResponse {
  taskId: string;
  description: string;
  assertions: SingleAssertion[];
}

export default function VerifierModal({ taskId, isOpen, onClose }: VerifierModalProps) {
  const [assertions, setAssertions] = useState<SingleAssertion[]>([]);
  const [expandedAssertions, setExpandedAssertions] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [executionLog, setExecutionLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifierData, setVerifierData] = useState<GetExpectedStateResponse | null>(null);
  const [assertionStatuses, setAssertionStatuses] = useState<
    Record<string, 'pending' | 'running' | 'passed' | 'failed'>
  >({});
  const [modelResponses, setModelResponses] = useState<Record<number, string>>({});
  const [modelResponsesErrors, setModelResponsesErrors] = useState<Record<number, string>>({});

  // Fetch verifier data when modal opens
  useEffect(() => {
    if (isOpen && taskId) {
      const fetchVerifierData = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch('/api/v1/get_expected_state', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId }),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
          }

          const data: GetExpectedStateResponse = await response.json();
          setVerifierData(data);

          setAssertions(
            data.assertions.map(assertion => ({
              ...assertion,
              status: 'pending' as const,
            }))
          );
          setExpandedAssertions(new Set());
          setCompletedCount(0);
          setExecutionLog([]);
        } catch (err) {
          console.error('Error fetching verifier data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch verifier data');
        } finally {
          setLoading(false);
        }
      };

      fetchVerifierData();
    }
  }, [isOpen, taskId]);

  // Handle escape key and outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const addLogEntry = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    setExecutionLog(prev => [
      ...prev,
      {
        id: `${Date.now().toString()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: `[${timestamp}]`,
        message,
        type,
      },
    ]);
  };

  const toggleAssertionExpansion = (assertionIndex: number) => {
    setExpandedAssertions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assertionIndex)) {
        newSet.delete(assertionIndex);
      } else {
        newSet.add(assertionIndex);
      }
      return newSet;
    });
  };

  const runAssertion = async (assertionIndex: number) => {
    const assertion = assertions[assertionIndex];
    if (!assertion) return;

    // Check if LLM_RUBRIC_JUDGE requires model response
    if (assertion.operator === 'LLM_RUBRIC_JUDGE' && !modelResponses[assertionIndex]) {
      setModelResponsesErrors(prev => ({
        ...prev,
        [assertionIndex]: 'Please enter a model response for this assertion.',
      }));
      // Expand the assertion to show the textarea
      setExpandedAssertions(prev => new Set([...prev, assertionIndex]));
      return;
    }

    addLogEntry(`Starting assertion: ${assertion.title}`);

    setAssertions(prev =>
      prev.map((a, index) => (index === assertionIndex ? { ...a, status: 'running' } : a))
    );

    try {
      // Capture current localStorage data
      const localStorageData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localStorageData[key] = localStorage.getItem(key) || '';
        }
      }

      // Convert localStorage data to a File object
      const dataStr = JSON.stringify(localStorageData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const localStorageFile = new File([dataBlob], 'localStorage.json', {
        type: 'application/json',
      });

      // Create form data for the API call
      const formData = new FormData();
      formData.append('taskId', taskId);
      formData.append('localStorageDump', localStorageFile);
      formData.append('assertion', JSON.stringify(assertion));

      // Add model response if it's an LLM_RUBRIC_JUDGE assertion
      if (assertion.operator === 'LLM_RUBRIC_JUDGE' && modelResponses[assertionIndex]) {
        formData.append('modelResponse', modelResponses[assertionIndex]);
      }

      // Call the get_actual_state endpoint
      const response = await fetch('/api/v1/get_actual_state', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update assertion with the result
      setAssertions(prev =>
        prev.map((a, index) =>
          index === assertionIndex
            ? {
                ...a,
                status: result.result === 'pass' ? 'passed' : 'failed',
                actual: result.actual,
                error: result.error,
                executionTime: result.executionTime,
                score: result.score,
                details: result.details,
              }
            : a
        )
      );

      setAssertionStatuses(prev => ({
        ...prev,
        [assertionIndex]: result.result === 'pass' ? 'passed' : 'failed',
      }));

      if (result.result === 'pass') {
        addLogEntry(`Assertion ${assertionIndex} PASSED: ${assertion.title}`, 'success');
        addLogEntry(`Actual value: ${JSON.stringify(result.actual)}`);
        addLogEntry(`Expected value: ${JSON.stringify(result.expected)}`);
        addLogEntry(`Execution time: ${result.executionTime}ms`);
      } else {
        addLogEntry(`Assertion ${assertionIndex} FAILED: ${assertion.title}`, 'error');
        if (result.error) {
          addLogEntry(`Error: ${result.error}`);
        }
        addLogEntry(`Actual value: ${JSON.stringify(result.actual)}`);
        addLogEntry(`Expected value: ${JSON.stringify(result.expected)}`);
        addLogEntry(`Execution time: ${result.executionTime}ms`);
      }
      setCompletedCount(prev => prev + 1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      setAssertions(prev =>
        prev.map((a, index) =>
          index === assertionIndex
            ? {
                ...a,
                status: 'failed',
                error: errorMessage,
                executionTime: 0,
              }
            : a
        )
      );

      addLogEntry(`Assertion ${assertionIndex} FAILED: ${assertion.title}`, 'error');
      addLogEntry(`Error: ${errorMessage}`);
    }
  };

  const runAllAssertions = async () => {
    setIsRunning(true);
    setCompletedCount(0);
    addLogEntry(`Starting execution of ${assertions.length} assertions`);

    // Check for missing model responses before starting
    for (let i = 0; i < assertions.length; i++) {
      if (assertions[i].operator === 'LLM_RUBRIC_JUDGE' && !modelResponses[i]) {
        setModelResponsesErrors(prev => ({
          ...prev,
          [i]: 'Please enter a model response for this assertion.',
        }));
        // Expand the assertion to show the textarea
        setExpandedAssertions(prev => new Set([...prev, i]));
        setIsRunning(false);
        return;
      }
    }

    for (let i = 0; i < assertions.length; i++) {
      await runAssertion(i);
    }

    addLogEntry(`Execution completed. All assertions have been processed.`);
    setIsRunning(false);
  };

  const clearResults = () => {
    setAssertions(prev =>
      prev.map(a => ({
        ...a,
        status: 'pending' as const,
        actual: undefined,
        error: undefined,
        executionTime: undefined,
        score: undefined,
        details: undefined,
      }))
    );
    setAssertionStatuses({});
    setModelResponses({});
    setModelResponsesErrors({});
    setCompletedCount(0);
    setExecutionLog([]);
    setTimeout(() => {
      addLogEntry('Results cleared');
    }, 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'PASSED';
      case 'failed':
        return 'FAILED';
      case 'running':
        return 'RUNNING';
      default:
        return 'PENDING';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3 border-b pb-3">
            <div className="flex items-center justify-between flex-1 gap-4">
              <h2 className="text-xl font-bold text-gray-900">Raw Verifier - {taskId}</h2>
              <div className="flex items-center gap-2">
                {Object.values(assertionStatuses).length === 0 ? (
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                ) : !isRunning && Object.values(assertionStatuses).length !== assertions.length ? (
                  <div className="w-3 h-3 bg-amber-400 rounded-full" />
                ) : isRunning ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : Object.values(assertionStatuses).every(status => status === 'passed') ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-gray-500">
                  {Object.values(assertionStatuses).length === 0
                    ? 'Ready to run'
                    : Object.values(assertionStatuses).length !== assertions.length
                    ? `${Object.values(assertionStatuses).length} / ${
                        assertions.length
                      } assertions running`
                    : Object.values(assertionStatuses).every(status => status === 'passed')
                    ? 'All assertions passed'
                    : Object.values(assertionStatuses).every(status => status === 'failed')
                    ? 'All assertions failed'
                    : `${
                        Object.values(assertionStatuses).filter(status => status === 'failed')
                          .length
                      } / ${assertions.length} assertions failed`}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto p-2 max-h-[80vh]">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading verifier data...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading verifier data
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && verifierData && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Prompt ID: {verifierData.taskId}
                  </h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-700 leading-relaxed text-sm font-mono">
                      {verifierData.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assertions ({assertions.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={runAllAssertions}
                        disabled={isRunning}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        Run All
                      </button>
                      <button
                        onClick={clearResults}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {assertions.map((assertion, index) => {
                      const isExpanded = expandedAssertions.has(index);

                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                        >
                          <div className="p-4">
                            <div
                              className="flex items-center justify-between"
                              onClick={() => {
                                toggleAssertionExpansion(index);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(assertion.status || 'pending')}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {assertion.title || `Assertion ${index + 1}`}
                                  </h4>

                                  <p className="text-sm text-gray-500 font-mono">
                                    {assertion.operator}
                                    {assertion.operator !== 'LLM_RUBRIC_JUDGE' &&
                                      assertion.path &&
                                      ` - ${assertion.path}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    runAssertion(index);
                                  }}
                                  disabled={(assertion.status || 'pending') === 'running'}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                >
                                  Run
                                </button>
                                <button
                                  onClick={() => toggleAssertionExpansion(index)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 space-y-4">
                                {assertion.operator === 'LLM_RUBRIC_JUDGE' && (
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Model Response:
                                    </label>
                                    <textarea
                                      className={`w-full h-24 px-3 py-2 border rounded-md resize-none text-sm ${
                                        modelResponsesErrors[index]
                                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                      }`}
                                      placeholder="Enter model response"
                                      value={modelResponses[index] || ''}
                                      onChange={e => {
                                        setModelResponses(prev => ({
                                          ...prev,
                                          [index]: e.target.value,
                                        }));
                                        // Clear error when user starts typing
                                        if (modelResponsesErrors[index]) {
                                          setModelResponsesErrors(prev => ({
                                            ...prev,
                                            [index]: '',
                                          }));
                                        }
                                      }}
                                      onFocus={() => {
                                        // Clear error when user focuses
                                        if (modelResponsesErrors[index]) {
                                          setModelResponsesErrors(prev => ({
                                            ...prev,
                                            [index]: '',
                                          }));
                                        }
                                      }}
                                    />
                                    {modelResponsesErrors[index] && (
                                      <div className="text-sm text-red-600">
                                        {modelResponsesErrors[index]}
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">
                                    Assertion Details:
                                  </h5>
                                  <div className="bg-gray-50 rounded p-3">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                      {JSON.stringify(assertion, null, 2)}
                                    </pre>
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">
                                    Verification Result:
                                  </h5>
                                  <div className="bg-gray-50 rounded p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getStatusIcon(assertion.status || 'pending')}
                                      <span
                                        className={`font-medium ${getStatusColor(
                                          assertion.status || 'pending'
                                        )}`}
                                      >
                                        {getStatusText(assertion.status || 'pending')}
                                        {assertion.executionTime &&
                                          ` (${assertion.executionTime}ms)`}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="font-medium">Operator:</span>{' '}
                                          {assertion.operator}
                                        </div>
                                        <div>
                                          <span className="font-medium">Result:</span>
                                          <span
                                            className={`ml-1 ${
                                              assertion.status === 'passed'
                                                ? 'text-green-600'
                                                : assertion.status === 'failed'
                                                ? 'text-red-600'
                                                : 'text-gray-600'
                                            }`}
                                          >
                                            {assertion.status === 'passed'
                                              ? 'pass'
                                              : assertion.status === 'failed'
                                              ? 'fail'
                                              : 'pending'}
                                          </span>
                                        </div>
                                      </div>
                                      {assertion.error && (
                                        <div className="bg-red-100 text-red-800 p-2 rounded text-xs">
                                          <span className="font-medium">Error:</span>{' '}
                                          {assertion.error}
                                        </div>
                                      )}
                                      {assertion.operator === 'LLM_RUBRIC_JUDGE' ? (
                                        <div className="space-y-3">
                                          <div>
                                            <span className="font-medium">Model Response:</span>
                                            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-y-auto">
                                              {assertion.actual !== undefined
                                                ? JSON.stringify(assertion.actual)
                                                : 'N/A'}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium">Expected:</span>
                                            <div className="mt-1 space-y-2">
                                              <div>
                                                <span className="text-xs text-gray-600">Text:</span>
                                                <div className="p-2 bg-gray-100 rounded text-xs font-mono  overflow-y-auto">
                                                  {assertion.expected?.text
                                                    ? JSON.stringify(assertion.expected.text)
                                                    : 'N/A'}
                                                </div>
                                              </div>
                                              {assertion.expected?.fields && (
                                                <div>
                                                  <span className="text-xs text-gray-600">
                                                    Fields:
                                                  </span>
                                                  <div className="p-2 bg-gray-100 rounded text-xs font-mono  overflow-y-auto">
                                                    {JSON.stringify(assertion.expected.fields)}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {assertion.details && (
                                            <div className="space-y-2">
                                              <div>
                                                <span className="font-medium">Rationale:</span>
                                                <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono  overflow-y-auto">
                                                  {assertion.details.rationale}
                                                </div>
                                              </div>
                                              <div>
                                                <span className="font-medium">Score:</span>
                                                <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono  overflow-y-auto">
                                                  {assertion.score}
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                  <span className="text-xs text-gray-600">
                                                    Overall Score:
                                                  </span>
                                                  <div className="p-2 bg-gray-100 rounded text-xs font-mono  overflow-y-auto">
                                                    {assertion.details.overall}
                                                  </div>
                                                </div>
                                                <div>
                                                  <span className="text-xs text-gray-600">
                                                    Hard Rules Triggered:
                                                  </span>
                                                  <div className="p-2 bg-gray-100 rounded text-xs font-mono  overflow-y-auto">
                                                    {assertion.details.hard_rules_triggered.length >
                                                    0
                                                      ? assertion.actual.details.hard_rules_triggered.join(
                                                          ', '
                                                        )
                                                      : 'None'}
                                                  </div>
                                                </div>
                                              </div>
                                              <div>
                                                <span className="text-xs text-gray-600">
                                                  Criteria:
                                                </span>
                                                <div className="space-y-1">
                                                  {assertion.details.criteria &&
                                                    Object.entries(assertion.details.criteria).map(
                                                      ([key, value]) => (
                                                        <div
                                                          key={key}
                                                          className="p-2 bg-gray-100 rounded text-xs font-mono"
                                                        >
                                                          <span className="font-medium capitalize">
                                                            {key}:
                                                          </span>{' '}
                                                          {String(value)}
                                                        </div>
                                                      )
                                                    )}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <span className="font-medium">Actual:</span>
                                            <span className="ml-1 font-mono text-xs">
                                              {assertion.actual !== undefined
                                                ? String(assertion.actual)
                                                : 'N/A'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-medium">Expected:</span>
                                            <span className="ml-1 font-mono text-xs">
                                              {String(assertion.expected)}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {assertion.executionTime !== undefined && (
                                        <div>
                                          <span className="font-medium">Execution Time:</span>{' '}
                                          {assertion.executionTime}ms
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Log</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
                    {executionLog.length === 0 ? (
                      <div className="text-gray-500">
                        No execution log entries yet. Run some assertions to see the log.
                      </div>
                    ) : (
                      executionLog.map(entry => (
                        <div
                          key={entry.id}
                          className={`mb-1 ${
                            entry.type === 'success'
                              ? 'text-green-600'
                              : entry.type === 'error'
                              ? 'text-red-600'
                              : 'text-gray-700'
                          }`}
                        >
                          <span className="text-gray-500">{entry.timestamp}</span> {entry.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
