'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import LandingPageFooter from '@/components/landing-page-footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <LandingPageFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar />
        <div className="flex-1 w-0 min-w-0 md:ml-[220px]">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
