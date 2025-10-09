'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { createPatch } from 'diff';
import { parseDiff } from 'react-diff-view';
import { UTCDate } from '@date-fns/utc';
import DiffView from '@/components/DiffView';
import {
  sortObjectKeys,
  processJsonWithHtmlTags,
  stringifyReplacer,
  KEYS_TO_CLEAN,
} from '@/lib/verification-utils';
import tasks from '@/data/tasks.json';

import 'react-diff-view/style/index.css';

interface VerificationResult {
  flowId: string;
  passed: boolean | undefined;
  error: string | null;
  executionTime: number;
  diffFiles: any[];
  ranAt: Date;
}

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [runningPrompt, setRunningPrompt] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: string; text: string } | null>(null);
  const [ranAt, setRanAt] = useState<Date | null>(null);
  const [testResults, setTestResults] = useState<Record<string, VerificationResult>>({});
  const [collapsedDescriptions, setCollapsedDescriptions] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      Object.keys(tasks).forEach(promptId => {
        initial[promptId] = true; // Start collapsed
      });
      return initial;
    }
  );
  const [collapsedDiffResults, setCollapsedDiffResults] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(tasks).forEach(promptId => {
      initial[promptId] = true; // Start collapsed
    });
    return initial;
  });

  const promptIds = useMemo(() => Object.keys(tasks), []);

  const getTestStatus = (promptId: string) => {
    if (!testResults[promptId]) return 'Not Run';
    return testResults[promptId].passed ? 'Passed' : 'Failed';
  };

  const getTestStatusIcon = (promptId: string) => {
    if (!testResults[promptId]) return '⏰';
    return testResults[promptId].passed ? '✅' : '❌';
  };

  const toggleDescription = (promptId: string) => {
    setCollapsedDescriptions(prev => ({
      ...prev,
      [promptId]: !prev[promptId],
    }));
  };

  const toggleDiffResults = (promptId: string) => {
    setCollapsedDiffResults(prev => ({
      ...prev,
      [promptId]: !prev[promptId],
    }));
  };

  const runVerification = (specificTaskId: string) => {
    const taskToRun = specificTaskId;
    if (!taskToRun) {
      return setBanner({ type: 'error', text: 'Please select a task ID.' });
    }

    setRunningPrompt(taskToRun);
    setBanner(null);

    const expectedResult = (tasks as any)[taskToRun].result;

    let diffFiles: any[] = [];
    const startTime = Date.now();
    for (const key of Object.keys(expectedResult)) {
      const actualRaw = localStorage.getItem(key);
      const cleanedExpectedJson = processJsonWithHtmlTags(
        JSON.parse(expectedResult[key]),
        KEYS_TO_CLEAN
      );
      const cleanedActualJson = processJsonWithHtmlTags(
        JSON.parse(actualRaw || '{}'),
        KEYS_TO_CLEAN
      );

      const oldStr = JSON.stringify(sortObjectKeys(cleanedExpectedJson), stringifyReplacer, 2);
      const newStr = JSON.stringify(sortObjectKeys(cleanedActualJson), stringifyReplacer, 2);

      let patch = createPatch(key, oldStr, newStr);
      // Remove the first 2 lines from the generated patch, to ensure proper parsing
      patch = patch.split('\n').slice(2).join('\n');
      let diffFile;
      try {
        diffFile = parseDiff(patch);
      } catch (error) {
        diffFile = null;
      }

      // Check if diffFile has any elements before accessing
      if (diffFile && Array.isArray(diffFile) && diffFile.length > 0 && diffFile[0]) {
        diffFile[0].key = key;
        diffFile[0].oldSource = JSON.stringify(
          sortObjectKeys(cleanedExpectedJson),
          stringifyReplacer,
          2
        );
        diffFiles.push(diffFile[0]);
      } else {
        // Create a dummy diffFile for cases where there are no differences
        const dummyDiffFile = {
          key: key,
          type: 'modify',
          hunks: [],
          oldSource: JSON.stringify(sortObjectKeys(cleanedExpectedJson), stringifyReplacer, 2),
          newSource: JSON.stringify(sortObjectKeys(cleanedActualJson), stringifyReplacer, 2),
        };
        diffFiles.push(dummyDiffFile);
      }
    }

    setLoading(true);
    setTimeout(() => {
      const passed = !diffFiles.some(file => file.hunks?.length > 0);
      const executionTime = Date.now() - startTime;

      setTestResults(prev => ({
        ...prev,
        [taskToRun]: {
          flowId: taskToRun,
          passed,
          error: null,
          executionTime,
          diffFiles,
          ranAt: new UTCDate(),
        },
      }));

      if (passed) {
        setBanner({ type: 'success', text: `✅ ${taskToRun} — Passed!` });
      } else {
        setBanner({ type: 'error', text: `❌ ${taskToRun} — Failed.` });
      }

      setRanAt(new UTCDate());
      setLoading(false);
      setRunningPrompt(null);
    }, 100);
  };

  const runAllFiltered = () => {
    promptIds.forEach((promptId, index) => {
      setTimeout(() => runVerification(promptId), index * 100);
    });
  };

  const clearResults = () => {
    setTestResults({});
    setBanner(null);
    setRanAt(null);
    localStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    document.title = 'Task Verifier Dashboard';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Verifier Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={runAllFiltered}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Run All
              </button>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Banner */}
          {banner && (
            <div
              className={`mb-6 p-4 rounded-md ${
                banner.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex">
                {banner.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      banner.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {banner.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Test Cases List */}
          <div className="space-y-4">
            {promptIds.map((promptId, index) => {
              const task = (tasks as any)[promptId];
              const status = getTestStatus(promptId);
              const statusIcon = getTestStatusIcon(promptId);
              const isRunning = runningPrompt === promptId;
              const result = testResults[promptId];
              const isDescriptionCollapsed = collapsedDescriptions[promptId];
              const isDiffResultsCollapsed = collapsedDiffResults[promptId];

              return (
                <div
                  key={promptId}
                  className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-900">#{index + 1}</div>
                      <div className="text-2xl">{isRunning ? '⏳' : statusIcon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Prompt ID: {promptId}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {status} {result && `(${result.executionTime}ms)`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDescription(promptId)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {isDescriptionCollapsed ? '▶' : '▼'} Prompt
                      </button>
                      <button
                        onClick={() => runVerification(promptId)}
                        disabled={isRunning}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {isRunning ? 'Running...' : '▶ Run'}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Description */}
                  {!isDescriptionCollapsed && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <p className="text-gray-900 leading-relaxed font-mono text-sm">
                        {task.prompt}
                      </p>
                    </div>
                  )}

                  {/* Collapsible Diff Results */}
                  {result && result.diffFiles && result.diffFiles.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <button
                        onClick={() => toggleDiffResults(promptId)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                      >
                        <span>{isDiffResultsCollapsed ? '▶' : '▼'}</span>
                        <span>Diff Results</span>
                        <span
                          className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {result.passed ? '✅ Passed' : '❌ Failed'}
                        </span>
                      </button>

                      {!isDiffResultsCollapsed && (
                        <div className="space-y-4">
                          {result.diffFiles.map(({ key, type, hunks, oldSource }, idx) => (
                            <div key={key} className="border rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Comparison of{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>{' '}
                                {hunks?.length > 0 ? '❌' : '✅'}
                              </h4>
                              {hunks && Array.isArray(hunks) && hunks.length > 0 ? (
                                <DiffView
                                  hunks={hunks}
                                  onExpandRange={() => {}}
                                  oldSource={oldSource}
                                />
                              ) : (
                                <div className="text-green-600 bg-green-50 p-3 rounded">
                                  No differences. Everything was correctly added.
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
