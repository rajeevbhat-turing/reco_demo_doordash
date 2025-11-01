import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import LocalStorageSync from '@/components/LocalStorageSync';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DashDoor: Food Delivery & Takeaway',
  description: 'Order food online from restaurants and get it delivered to your door',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LocalStorageSync />
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1 relative">
            <Sidebar />
            <div className="flex-1 w-0 min-w-0 md:ml-[220px]">
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </div>

        {/* Global Functions Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              /** ===== Run bootstrap (sets run_id) ===== */
              // Only run on client-side
              if (typeof window !== 'undefined') {
                const RUN_ID_KEY = "current_run_id"; // we'll store under this key; also expose window.RUN_ID
                
                async function bootstrapRun() {
                const url = new URL(window.location.href);
                const urlRun = url.searchParams.get("run_id"); // may be null
                const storedRun = localStorage.getItem(RUN_ID_KEY); // may be null
                
                if (url.pathname.startsWith("/api/v1")) {
                  return;
                }
                
                // Decide the run_id to use:
                let runId = urlRun || storedRun || "00000000-0000-0000-0000-000000000000";
                
                // If URL provided a run_id and it's different from stored, start fresh
                if (urlRun && urlRun !== storedRun) {
                  localStorage.clear();
                  localStorage.setItem(RUN_ID_KEY, urlRun);
                  runId = urlRun;
                } else {
                  // Ensure it's persisted when coming from storedRun or default
                  localStorage.setItem(RUN_ID_KEY, runId);
                }
                
                // Make it visible globally if you want to read it elsewhere quickly
                window.RUN_ID = runId;
                
                // Idempotent registration on the server (safe to fail and continue)
                try {
                  await fetch("/api/v1/run/init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ run_id: runId }),
                  });
                  console.log('Run registered with server:', runId);
                } catch (e) {
                  // Non-fatal: the app can still run; mirror writes will retry later
                  console.warn("run/init failed:", e);
                }
                
                // Clean the URL (remove run_id param, keep other params/hash)
                if (urlRun) {
                  url.searchParams.delete("run_id");
                  const newQuery = url.searchParams.toString();
                  const cleaned = url.pathname + (newQuery ? '?' + newQuery : "") + (url.hash || "");
                  window.history.replaceState({}, "", cleaned);
                }
                
                return runId;
              }
              
              // Run bootstrap on page load
              bootstrapRun();

              // Add global verification functions
              window.verify = async (taskId) => {
                try {
                  const RUN_MODE = '${process.env.VITE_RUN_MODE || 'localstorage'}';
                  
                  if (RUN_MODE === 'runid') {
                    // Use database verification (run_id based)
                    const currentRunId = localStorage.getItem('current_run_id') || '00000000-0000-0000-0000-000000000000';
                    const response = await fetch('/api/v1/run/verify?run_id=' + currentRunId + '&prompt_id=' + taskId, {
                      method: 'GET'
                    });
                    
                    if (!response.ok) {
                      throw new Error('HTTP error! status: ' + response.status);
                    }
                    
                    const result = await response.json();
                    console.log('Verification for ' + taskId + ': ' + (result.passed ? 'passed' : 'failed'));
                    return result;
                  } else {
                    // Use browser localStorage verification (localstorage mode)
                    const localStorageData = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key) {
                        localStorageData[key] = localStorage.getItem(key);
                      }
                    }
                    
                    // Call the SQLite verification endpoint
                    const response = await fetch('/api/verify/run', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        prompt_id: taskId,
                        cartState: null, // Not used when localStorage is provided
                        localStorage: localStorageData
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error('HTTP error! status: ' + response.status);
                    }
                    
                    const result = await response.json();
                    console.log('Verification for ' + taskId + ': ' + (result.passed ? 'passed' : 'failed'));
                    return result;
                  }
                } catch (error) {
                  console.error('Verification failed:', error);
                  return { "prompt_id": taskId, "result": "failed" };
                }
              };

                      // Set up reset function with session-based logic
                      window.reset = async () => {
                        try {
                          const sessionMode = localStorage.getItem('session_mode');
                          
                          if (sessionMode === 'with-run-id') {
                            // In with-run-id mode: generate new run_id and reset
                            const newRunId = 'reset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
                            
                            // Update session
                            localStorage.setItem('current_run_id', newRunId);
                            
                            // Clear localStorage but preserve session tracking
                            const savedSessionMode = localStorage.getItem('session_mode');
                            localStorage.clear();
                            localStorage.setItem('session_mode', savedSessionMode || 'with-run-id');
                            localStorage.setItem('current_run_id', newRunId);
                            localStorage.setItem('last_run_id', newRunId);
                            
                            console.log('WITH-RUN-ID Reset: Generated new run_id:', newRunId);
                            
                            // Redirect with new run_id
                            window.location.href = '/?run_id=' + newRunId;
                          } else {
                            // In without-run-id mode: just clear localStorage manually but preserve session tracking
                            const savedSessionMode = localStorage.getItem('session_mode');
                            localStorage.clear();
                            localStorage.setItem('session_mode', savedSessionMode || 'without-run-id');
                            localStorage.setItem('current_run_id', '00000000-0000-0000-0000-000000000000');
                            localStorage.setItem('last_run_id', '00000000-0000-0000-0000-000000000000');
                            
                            console.log('WITHOUT-RUN-ID Reset: Cleared localStorage manually');
                            
                            // Redirect to clean URL (no run_id)
                            window.location.href = '/';
                          }
                        } catch (error) {
                          console.error('Reset failed:', error);
                        }
                      };

              console.log('Global functions loaded! Available:');
              console.log('- window.verify("task-id")');
              console.log('- window.reset()');

              // Global error handler to prevent console errors
              window.addEventListener('error', (event) => {
                // Suppress specific errors that don't affect functionality
                if (event.message.includes('Failed to fetch') && event.filename?.includes('il-canto-cafe')) {
                  event.preventDefault();
                  return false;
                }
                if (event.message.includes('ERR_NAME_NOT_RESOLVED') && event.filename?.includes('placeholder')) {
                  event.preventDefault();
                  return false;
                }
              });

              // Suppress specific console errors
              const originalConsoleError = console.error;
              console.error = (...args) => {
                const message = args.join(' ');
                // Suppress specific error messages
                if (message.includes('Failed to fetch') && message.includes('il-canto-cafe')) {
                  return;
                }
                if (message.includes('ERR_NAME_NOT_RESOLVED') && message.includes('placeholder')) {
                  return;
                }
                // Log other errors normally
                originalConsoleError.apply(console, args);
              };
              } // End client-side check
            `,
          }}
        />
      </body>
    </html>
  );
}
