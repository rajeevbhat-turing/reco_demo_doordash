'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Assertion {
  id: string;
  title: string;
  operator: string;
  path: string;
  expected: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  actual?: string;
  error?: string;
  executionTime?: number;
}

interface Verifier {
  id: string;
  title: string;
  description: string;
  status: 'ready' | 'running' | 'completed' | 'failed';
  assertions: number;
  completedAssertions: number;
  category: string;
  lastRun?: Date;
}

interface VerifierModalProps {
  verifier: Verifier;
  isOpen: boolean;
  onClose: () => void;
}

// Mock assertions data
const getMockAssertions = (verifierId: string): Assertion[] => {
  const baseAssertions: Record<string, Assertion[]> = {
    'DOORDASH-ORDER-CREATE-001': [
      {
        id: '1',
        title: "Order should be created with customer email 'john.doe@example.com'",
        operator: 'JSON_MATCH',
        path: 'orders[0].customer.email',
        expected: 'john.doe@example.com',
        status: 'pending',
      },
      {
        id: '2',
        title: "Order should be from restaurant 'Philz Coffee'",
        operator: 'JSON_MATCH',
        path: 'orders[0].restaurant.name',
        expected: 'Philz Coffee',
        status: 'pending',
      },
      {
        id: '3',
        title: "Order should contain 'Large Coffee' item",
        operator: 'JSON_MATCH',
        path: 'orders[0].items[0].name',
        expected: 'Large Coffee',
        status: 'pending',
      },
      {
        id: '4',
        title: "Order should contain 'Chocolate Croissant' item",
        operator: 'JSON_MATCH',
        path: 'orders[0].items[1].name',
        expected: 'Chocolate Croissant',
        status: 'pending',
      },
      {
        id: '5',
        title: 'Order should have correct delivery address',
        operator: 'JSON_MATCH',
        path: 'orders[0].delivery.address',
        expected: '123 Main St, San Francisco, CA 94102',
        status: 'pending',
      },
      {
        id: '6',
        title: "Order should have status 'confirmed'",
        operator: 'JSON_MATCH',
        path: 'orders[0].status',
        expected: 'confirmed',
        status: 'pending',
      },
      {
        id: '7',
        title: 'Order should have correct total amount',
        operator: 'JSON_MATCH',
        path: 'orders[0].total',
        expected: '24.99',
        status: 'pending',
      },
    ],
    'CART-ADD-ITEMS-002': [
      {
        id: '1',
        title: "Cart should contain 'Organic Milk' item",
        operator: 'JSON_MATCH',
        path: 'cart.items[0].name',
        expected: 'Organic Milk',
        status: 'pending',
      },
      {
        id: '2',
        title: "Cart should contain 'Whole Wheat Bread' item",
        operator: 'JSON_MATCH',
        path: 'cart.items[1].name',
        expected: 'Whole Wheat Bread',
        status: 'pending',
      },
      {
        id: '3',
        title: "Cart should contain 'Fresh Bananas' item",
        operator: 'JSON_MATCH',
        path: 'cart.items[2].name',
        expected: 'Fresh Bananas',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Cart should have correct total items count',
        operator: 'JSON_MATCH',
        path: 'cart.totalItems',
        expected: '3',
        status: 'pending',
      },
      {
        id: '5',
        title: 'Cart should have correct subtotal',
        operator: 'JSON_MATCH',
        path: 'cart.subtotal',
        expected: '18.47',
        status: 'pending',
      },
    ],
    'RESTAURANT-SEARCH-003': [
      {
        id: '1',
        title: "Search should return restaurants with 'pizza' in name",
        operator: 'JSON_MATCH',
        path: 'search.results[0].name',
        expected: 'Pizza Palace',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Search results should have rating >= 4.0',
        operator: 'JSON_MATCH',
        path: 'search.results[0].rating',
        expected: '4.5',
        status: 'pending',
      },
      {
        id: '3',
        title: 'Search should return delivery time information',
        operator: 'JSON_MATCH',
        path: 'search.results[0].deliveryTime',
        expected: '25-35 min',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Search should return at least 3 results',
        operator: 'JSON_MATCH',
        path: 'search.totalResults',
        expected: '5',
        status: 'pending',
      },
    ],
    'PAYMENT-PROCESS-004': [
      {
        id: '1',
        title: "Payment should be processed with card ending in '1234'",
        operator: 'JSON_MATCH',
        path: 'payment.card.last4',
        expected: '1234',
        status: 'pending',
      },
      {
        id: '2',
        title: "Payment should have status 'completed'",
        operator: 'JSON_MATCH',
        path: 'payment.status',
        expected: 'completed',
        status: 'pending',
      },
      {
        id: '3',
        title: 'Payment should calculate correct tax amount',
        operator: 'JSON_MATCH',
        path: 'payment.tax',
        expected: '2.15',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Payment should include delivery fee',
        operator: 'JSON_MATCH',
        path: 'payment.deliveryFee',
        expected: '3.99',
        status: 'pending',
      },
      {
        id: '5',
        title: 'Payment should have correct total amount',
        operator: 'JSON_MATCH',
        path: 'payment.total',
        expected: '24.99',
        status: 'pending',
      },
      {
        id: '6',
        title: 'Payment should generate transaction ID',
        operator: 'JSON_MATCH',
        path: 'payment.transactionId',
        expected: 'txn_123456789',
        status: 'pending',
      },
    ],
    'DASHPASS-VALIDATION-005': [
      {
        id: '1',
        title: 'DashPass member should get free delivery',
        operator: 'JSON_MATCH',
        path: 'dashpass.deliveryFee',
        expected: '0.00',
        status: 'pending',
      },
      {
        id: '2',
        title: 'DashPass member should get reduced service fee',
        operator: 'JSON_MATCH',
        path: 'dashpass.serviceFee',
        expected: '1.99',
        status: 'pending',
      },
      {
        id: '3',
        title: 'DashPass member should get exclusive discount',
        operator: 'JSON_MATCH',
        path: 'dashpass.discount',
        expected: '10%',
        status: 'pending',
      },
      {
        id: '4',
        title: 'DashPass membership should be active',
        operator: 'JSON_MATCH',
        path: 'dashpass.isActive',
        expected: 'true',
        status: 'pending',
      },
      {
        id: '5',
        title: 'DashPass should show savings amount',
        operator: 'JSON_MATCH',
        path: 'dashpass.savings',
        expected: '5.99',
        status: 'pending',
      },
      {
        id: '6',
        title: 'DashPass should have correct expiration date',
        operator: 'JSON_MATCH',
        path: 'dashpass.expiresAt',
        expected: '2024-12-31T23:59:59Z',
        status: 'pending',
      },
      {
        id: '7',
        title: 'DashPass should show member since date',
        operator: 'JSON_MATCH',
        path: 'dashpass.memberSince',
        expected: '2023-01-15T00:00:00Z',
        status: 'pending',
      },
      {
        id: '8',
        title: 'DashPass should track total orders',
        operator: 'JSON_MATCH',
        path: 'dashpass.totalOrders',
        expected: '47',
        status: 'pending',
      },
    ],
    'DELIVERY-TRACKING-006': [
      {
        id: '1',
        title: "Order should have initial status 'preparing'",
        operator: 'JSON_MATCH',
        path: 'delivery.status',
        expected: 'preparing',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Order should have assigned driver',
        operator: 'JSON_MATCH',
        path: 'delivery.driver.name',
        expected: 'Mike Johnson',
        status: 'pending',
      },
      {
        id: '3',
        title: 'Order should have estimated delivery time',
        operator: 'JSON_MATCH',
        path: 'delivery.estimatedTime',
        expected: '25 min',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Order should have tracking updates',
        operator: 'JSON_MATCH',
        path: 'delivery.updates[0].status',
        expected: 'picked_up',
        status: 'pending',
      },
      {
        id: '5',
        title: 'Order should have delivery address',
        operator: 'JSON_MATCH',
        path: 'delivery.address',
        expected: '123 Main St, San Francisco, CA 94102',
        status: 'pending',
      },
      {
        id: '6',
        title: "Order should have final status 'delivered'",
        operator: 'JSON_MATCH',
        path: 'delivery.finalStatus',
        expected: 'delivered',
        status: 'pending',
      },
    ],
    'RESTAURANT-REVIEWS-007': [
      {
        id: '1',
        title: 'Review should be submitted with 5-star rating',
        operator: 'JSON_MATCH',
        path: 'review.rating',
        expected: '5',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Review should have correct comment',
        operator: 'JSON_MATCH',
        path: 'review.comment',
        expected: 'Great coffee and fast delivery',
        status: 'pending',
      },
      {
        id: '3',
        title: 'Review should be associated with Philz Coffee',
        operator: 'JSON_MATCH',
        path: 'review.restaurant.name',
        expected: 'Philz Coffee',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Review should be published and visible',
        operator: 'JSON_MATCH',
        path: 'review.status',
        expected: 'published',
        status: 'pending',
      },
    ],
    'GROUP-ORDER-CREATE-008': [
      {
        id: '1',
        title: 'Group order should be created for Chipotle',
        operator: 'JSON_MATCH',
        path: 'groupOrder.restaurant.name',
        expected: 'Chipotle',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Group order should have 5 participants',
        operator: 'JSON_MATCH',
        path: 'groupOrder.participants.length',
        expected: '5',
        status: 'pending',
      },
      {
        id: '3',
        title: 'Group order should have organizer',
        operator: 'JSON_MATCH',
        path: 'groupOrder.organizer.name',
        expected: 'Sarah Wilson',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Group order should have correct total',
        operator: 'JSON_MATCH',
        path: 'groupOrder.total',
        expected: '89.50',
        status: 'pending',
      },
      {
        id: '5',
        title: "Group order should have status 'pending'",
        operator: 'JSON_MATCH',
        path: 'groupOrder.status',
        expected: 'pending',
        status: 'pending',
      },
    ],
  };

  return (
    baseAssertions[verifierId] || [
      {
        id: '1',
        title: 'Sample assertion for testing',
        operator: 'JSON_MATCH',
        path: 'data.value',
        expected: 'expected_value',
        status: 'pending',
      },
    ]
  );
};

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function VerifierModal({ verifier, isOpen, onClose }: VerifierModalProps) {
  const [assertions, setAssertions] = useState<Assertion[]>([]);
  const [expandedAssertions, setExpandedAssertions] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [executionLog, setExecutionLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAssertions(getMockAssertions(verifier.id));
      setExpandedAssertions(new Set());
      setCompletedCount(0);
      setExecutionLog([]);
    }
  }, [isOpen, verifier.id]);

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
        id: Date.now().toString(),
        timestamp: `[${timestamp}]`,
        message,
        type,
      },
    ]);
  };

  const toggleAssertionExpansion = (assertionId: string) => {
    setExpandedAssertions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assertionId)) {
        newSet.delete(assertionId);
      } else {
        newSet.add(assertionId);
      }
      return newSet;
    });
  };

  const runAssertion = async (assertionId: string) => {
    const assertion = assertions.find(a => a.id === assertionId);
    if (!assertion) return;

    addLogEntry(`Starting assertion: ${assertion.title}`);

    setAssertions(prev => prev.map(a => (a.id === assertionId ? { ...a, status: 'running' } : a)));

    // Simulate running time
    const executionTime = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, executionTime));

    const success = Math.random() > 0.3;
    const actualValue = success ? assertion.expected : 'No actual value found';
    const error = success
      ? undefined
      : 'No actual value found, which means the proper sub-check is not completed.';
    const finalExecutionTime = Math.round(executionTime);

    setAssertions(prev =>
      prev.map(a =>
        a.id === assertionId
          ? {
              ...a,
              status: success ? 'passed' : 'failed',
              actual: actualValue,
              error,
              executionTime: finalExecutionTime,
            }
          : a
      )
    );

    if (success) {
      addLogEntry(`Assertion ${assertionId} PASSED: ${assertion.title}`, 'success');
      addLogEntry(`Actual value: "${actualValue}"`);
      addLogEntry(`Expected value: "${assertion.expected}"`);
      addLogEntry(`Execution time: ${finalExecutionTime}ms`);
      setCompletedCount(prev => prev + 1);
    } else {
      addLogEntry(`Assertion ${assertionId} FAILED: ${assertion.title}`, 'error');
      addLogEntry(`Error: ${error}`);
      addLogEntry(`Execution time: ${finalExecutionTime}ms`);
    }
  };

  const runAllAssertions = async () => {
    setIsRunning(true);
    setCompletedCount(0);
    addLogEntry(`Starting execution of ${assertions.length} assertions`);

    for (const assertion of assertions) {
      await runAssertion(assertion.id);
    }

    addLogEntry(
      `Execution completed. ${completedCount} of ${assertions.length} assertions passed.`
    );
    setIsRunning(false);
  };

  const clearResults = () => {
    setAssertions(prev =>
      prev.map(a => ({
        ...a,
        status: 'pending',
        actual: undefined,
        error: undefined,
        executionTime: undefined,
      }))
    );
    setCompletedCount(0);
    setExecutionLog([]);
    addLogEntry('Results cleared');
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
              <h2 className="text-xl font-bold text-gray-900">Raw Verifier - {verifier.id}</h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    completedCount === 0
                      ? 'bg-gray-500'
                      : isRunning
                      ? 'bg-blue-500 animate-pulse'
                      : completedCount === assertions.length
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                ></div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[80vh]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prompt ID: {verifier.id}</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-700 leading-relaxed text-sm font-mono">
                  {verifier.description}
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
                {assertions.map(assertion => {
                  const isExpanded = expandedAssertions.has(assertion.id);

                  return (
                    <div
                      key={assertion.id}
                      className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        toggleAssertionExpansion(assertion.id);
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(assertion.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{assertion.title}</h4>
                              <p className="text-sm text-gray-500 font-mono">
                                {assertion.operator} - {assertion.path}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                runAssertion(assertion.id);
                              }}
                              disabled={assertion.status === 'running'}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                            >
                              Run
                            </button>
                            <button
                              onClick={() => toggleAssertionExpansion(assertion.id)}
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
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Assertion Details:</h5>
                              <div className="bg-gray-50 rounded p-3">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {`{
  "title": "${assertion.title}",
  "operator": "${assertion.operator}",
  "path": "${assertion.path}",
  "expected": "${assertion.expected}",
  "options": {}
}`}
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                Verification Result:
                              </h5>
                              <div className="bg-gray-50 rounded p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(assertion.status)}
                                  <span
                                    className={`font-medium ${getStatusColor(assertion.status)}`}
                                  >
                                    {getStatusText(assertion.status)}
                                    {assertion.executionTime && ` (${assertion.executionTime}ms)`}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>Operator: {assertion.operator}</div>
                                  {assertion.error && (
                                    <div className="bg-red-100 text-red-800 p-2 rounded text-xs">
                                      {assertion.error}
                                    </div>
                                  )}
                                  <div>
                                    Actual: {assertion.actual ? `"${assertion.actual}"` : 'N/A'}
                                  </div>
                                  <div>Expected: "{assertion.expected}"</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
