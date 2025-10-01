'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import VerifierModal from '@/components/verifier-modal';
import assertionsData from '@/data/assertions.json';

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
}
interface Assertion {
  prompt: string;
  assertions: SingleAssertion[];
}

interface Verifier {
  id: string;
  assertion: Assertion;
  status: 'ready' | 'running' | 'completed' | 'failed';
  completedAssertions: number;
}

// Transform assertions data into verifiers
const getVerifiers = (): Verifier[] => {
  return Object.entries(assertionsData).map(([id, data]) => ({
    id,
    assertion: data,
    status: 'ready' as const,
    completedAssertions: 0,
  }));
};

export default function VerifyRawPage() {
  const [verifiers, setVerifiers] = useState<Verifier[]>(getVerifiers());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenVerifier = (verifier: Verifier) => {
    setSelectedTaskId(verifier.id);
    setIsModalOpen(true);
  };

  const handleClearResults = () => {
    localStorage.clear();
    window.location.reload();
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
                            #{index + 1}: {verifier.id}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{verifier.assertion.assertions.length} assertions</span>
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

      {selectedTaskId && (
        <VerifierModal
          taskId={selectedTaskId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
}
