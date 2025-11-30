'use client';

import { useEffect, useState, useRef } from 'react';
import { Download } from 'lucide-react';

export default function LocalStorageDownloadPage() {
  const [isDownloading, setIsDownloading] = useState(true);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    // Add global browser functions
    addGlobalFunctions();

    // Trigger download immediately when component mounts
    downloadLocalStorage();
  }, []);

  const addGlobalFunctions = () => {
    // Add window.verify function
    (window as any).verify = async (taskId: string) => {
      try {
        // Collect current localStorage data
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
        const file = new File([dataBlob], 'localStorage.json', { type: 'application/json' });

        // Create form data
        const formData = new FormData();
        formData.append('taskId', taskId);
        formData.append('localStorageData', file);

        // Make API call
        const response = await fetch('/api/verify', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          return {
            'task-id': taskId,
            result: 'failed',
          };
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Verification failed:', error);
        return {
          'task-id': taskId,
          result: 'failed',
        };
      }
    };

    // Add window.reset function
    (window as any).reset = () => {
      try {
        // Clear all localStorage
        localStorage.clear();

        // Initialize with default state
        const defaultCartState = {
          state: {
            items: [],
            currentStore: null,
            searchResults: [],
            lastSearchInfo: null,
            lastClearInfo: null,
            lastRemovalInfo: null,
            currentCategory: null,
            verifierConsumed: false,
            searchVerifierConsumed: false,
            removalVerifierConsumed: false,
            orderVerifierConsumed: false,
          },
        };

        const defaultOrdersState = {
          state: {
            orders: [],
          },
        };

        // Set default states
        localStorage.setItem('multicategory-cart', JSON.stringify(defaultCartState));
        localStorage.setItem('orders-store', JSON.stringify(defaultOrdersState));

        console.log('✅ Browser state reset successfully!');
        return true;
      } catch (error) {
        console.error('❌ Failed to reset browser state:', error);
        return false;
      }
    };

    console.log('🌐 Global functions added: window.verify(taskId) and window.reset()');
  };

  const downloadLocalStorage = () => {
    try {
      setIsDownloading(true);

      // Collect all localStorage data
      const localStorageData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localStorageData[key] = localStorage.getItem(key) || '';
        }
      }

      // Create and download the file
      const dataStr = JSON.stringify(localStorageData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'localStorage.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mark download as complete
      setDownloadComplete(true);
      setIsDownloading(false);

      // Redirect to home page after a short delay
      timeoutRef.current = setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error downloading localStorage:', error);
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Downloading LocalStorage Data</h1>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Your localStorage data is being downloaded automatically...
          </p>

          {isDownloading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {downloadComplete && (
            <div className="text-center">
              <div className="text-green-600 text-sm mb-2">✅ Download Complete!</div>
            </div>
          )}

          <p className="text-gray-600">You will be redirected to the home page in a moment.</p>
        </div>
      </div>
    </div>
  );
}
