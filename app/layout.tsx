import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { ReplaceCartProvider } from "@/context/replace-cart-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DashDoor: Food Delivery & Takeaway",
  description: "Order food online from restaurants and get it delivered to your door",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReplaceCartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 relative">
              <Sidebar />
              <div className="flex-1 w-0 min-w-0 md:ml-[220px]">
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </div>
        </ReplaceCartProvider>
        
        {/* Global Functions Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Add global verification functions
              window.verify = async (taskId) => {
                try {
                  // Get current localStorage data
                  const localStorageData = {};
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                      localStorageData[key] = localStorage.getItem(key);
                    }
                  }
                  
                  // Create FormData
                  const formData = new FormData();
                  formData.append('taskId', taskId);
                  formData.append('localStorageData', new Blob([JSON.stringify(localStorageData)], { type: 'application/json' }), 'localStorage.json');
                  
                  // Call the API
                  const response = await fetch('/api/verify', {
                    method: 'POST',
                    body: formData
                  });
                  
                  const result = await response.json();
                  console.log('Verification result:', result);
                  return result;
                } catch (error) {
                  console.error('Verification failed:', error);
                  return { "task-id": taskId, "result": "failed" };
                }
              };

              // Add global reset function
              window.reset = () => {
                localStorage.clear();
                // Set default states
                localStorage.setItem('multicategory-cart', JSON.stringify({
                  state: {
                    items: [],
                    currentCategory: 'restaurant', // Set default category to prevent undefined config
                    currentStoreId: null,
                    currentRestaurantId: null,
                    isGroupOrder: false,
                    groupOrderId: null,
                    searchResults: [],
                    totalCartValue: 0,
                    currentStore: null,
                    lastClearInfo: null,
                    maxItemsReached: false,
                    verifierConsumed: false,
                    lastSearchInfo: null,
                    searchVerifierConsumed: false,
                    lastRemovalInfo: null,
                    removalVerifierConsumed: false,
                    lastQuantityChangeInfo: null,
                    quantityVerifierConsumed: false,
                    lastOrderInfo: null,
                    orderVerifierConsumed: false
                  },
                  version: 0
                }));
                console.log('Browser state reset');
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
            `
          }}
        />
      </body>
    </html>
  )
}
