'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import VerifierModal from '@/components/verifier-modal';

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

// Mock data for verifiers
const mockVerifiers: Verifier[] = [
  {
    id: 'DOORDASH-ORDER-CREATE-001',
    title: 'DoorDash Order Creation',
    description:
      'Create a new order for delivery from Philz Coffee with 2 items: Large Coffee and Chocolate Croissant. The order should be placed by user john.doe@example.com with delivery address 123 Main St, San Francisco, CA 94102.',
    status: 'ready',
    assertions: 7,
    completedAssertions: 0,
    category: 'Order Management',
    lastRun: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'CART-ADD-ITEMS-002',
    title: 'Add Items to Cart',
    description:
      'Add 3 items to the cart from Safeway: Organic Milk (1 gallon), Whole Wheat Bread (1 loaf), and Fresh Bananas (2 lbs). Validate cart totals and item availability.',
    status: 'completed',
    assertions: 5,
    completedAssertions: 5,
    category: 'Cart Management',
    lastRun: new Date('2024-01-15T14:22:00Z'),
  },
  {
    id: 'RESTAURANT-SEARCH-003',
    title: 'Restaurant Search and Filter',
    description:
      'Search for "pizza" restaurants, filter by rating 4.0+, and verify results include proper restaurant information and delivery times.',
    status: 'failed',
    assertions: 4,
    completedAssertions: 2,
    category: 'Search & Discovery',
    lastRun: new Date('2024-01-15T16:45:00Z'),
  },
  {
    id: 'PAYMENT-PROCESS-004',
    title: 'Payment Processing',
    description:
      'Process payment for order using credit card ending in 1234, validate payment method, calculate taxes and fees, and confirm order total.',
    status: 'ready',
    assertions: 6,
    completedAssertions: 0,
    category: 'Payment',
    lastRun: new Date('2024-01-14T09:15:00Z'),
  },
  {
    id: 'DASHPASS-VALIDATION-005',
    title: 'DashPass Benefits Validation',
    description:
      'Verify DashPass member receives free delivery, reduced service fees, and exclusive discounts on eligible orders.',
    status: 'running',
    assertions: 8,
    completedAssertions: 3,
    category: 'DashPass',
    lastRun: new Date('2024-01-15T17:30:00Z'),
  },
  {
    id: 'DELIVERY-TRACKING-006',
    title: 'Delivery Tracking System',
    description:
      'Track order from restaurant preparation to delivery completion, update status at each stage, and send notifications to customer.',
    status: 'ready',
    assertions: 6,
    completedAssertions: 0,
    category: 'Delivery',
    lastRun: new Date('2024-01-14T11:20:00Z'),
  },
  {
    id: 'RESTAURANT-REVIEWS-007',
    title: 'Restaurant Review System',
    description:
      'Submit a 5-star review for Philz Coffee with comment "Great coffee and fast delivery", verify review appears in restaurant profile.',
    status: 'completed',
    assertions: 4,
    completedAssertions: 4,
    category: 'Reviews',
    lastRun: new Date('2024-01-15T12:15:00Z'),
  },
  {
    id: 'GROUP-ORDER-CREATE-008',
    title: 'Group Order Creation',
    description:
      'Create a group order for office lunch from Chipotle, invite 5 team members, collect individual orders, and process payment.',
    status: 'failed',
    assertions: 5,
    completedAssertions: 2,
    category: 'Group Orders',
    lastRun: new Date('2024-01-15T15:45:00Z'),
  },
];

export default function VerifyRawPage() {
  const [verifiers, setVerifiers] = useState<Verifier[]>(mockVerifiers);
  const [selectedVerifier, setSelectedVerifier] = useState<Verifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusIcon = (verifier: Verifier) => {
    switch (verifier.status) {
      case 'completed':
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

  const getStatusText = (verifier: Verifier) => {
    switch (verifier.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'running':
        return 'Running';
      default:
        return 'Ready to run';
    }
  };

  const getStatusColor = (verifier: Verifier) => {
    switch (verifier.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenVerifier = (verifier: Verifier) => {
    setSelectedVerifier(verifier);
    setIsModalOpen(true);
  };

  const handleClearResults = () => {
    setVerifiers(prev =>
      prev.map(v => ({
        ...v,
        status: 'ready' as const,
        completedAssertions: 0,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-4xl mx-auto px-6">
        <div className="rounded-lg p-8">
          <div className="flex  justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Declarative Raw Verifier</h1>
            </div>
            <div className="flex items-end gap-4 flex-col max-w-96">
              <button
                onClick={handleClearResults}
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-600/90 text-sm font-medium"
              >
                Clear Results
              </button>
              <p className="text-xs text-gray-500 text-right">
                *Clear the results before starting a new task. This will also clear local storage
                and reload this page, which will get the verifier ready for the next run.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {verifiers.map((verifier, index) => (
              <div
                key={verifier.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            #{index + 1}: {verifier.title}
                          </h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {verifier.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenVerifier(verifier)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {verifiers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No verifiers available.</div>
          )}
        </div>
      </div>

      {selectedVerifier && (
        <VerifierModal
          verifier={selectedVerifier}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVerifier(null);
          }}
        />
      )}
    </div>
  );
}
