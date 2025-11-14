import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from './main-layout';
import { GlobalContextProvider } from './global-context';
import { QueryProvider } from '@/lib/providers/query-provider';

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
        <QueryProvider>
          <GlobalContextProvider>
            <MainLayout>{children}</MainLayout>
          </GlobalContextProvider>

        {/* Global Functions Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Only run on client-side
              if (typeof window !== 'undefined') {
                // Set up reset function
                window.reset = async () => {
                  try {
                    localStorage.clear();
                    console.log('Reset: Cleared localStorage');
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Reset failed:', error);
                  }
                };

                console.log('Global functions loaded! Available:');
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
        </QueryProvider>
      </body>
    </html>
  );
}
