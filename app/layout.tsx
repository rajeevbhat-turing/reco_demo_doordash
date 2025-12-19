import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from './main-layout';
import { GlobalContextProvider } from './global-context';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ConditionalMainLayout } from './conditional-main-layout';
import { BootstrapInitializer } from '@/components/bootstrap-initializer';

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
            <BootstrapInitializer />
            <ConditionalMainLayout>{children}</ConditionalMainLayout>
          </GlobalContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}