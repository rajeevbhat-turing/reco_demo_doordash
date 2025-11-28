'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * TanStack Query Provider
 *
 * Wraps the application with QueryClientProvider for server state management.
 * This enables useQuery and useMutation hooks throughout the app.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance that persists across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Only refetch on mount/focus if data is stale
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Don't refetch on window focus (since we load data once from DB)
            refetchOnWindowFocus: false,
            // Don't retry failed queries (database errors should be handled explicitly)
            retry: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
