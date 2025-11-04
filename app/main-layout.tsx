'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import LandingPageFooter from '@/components/landing-page-footer';
import LayoutWrapper from '@/components/layout-wrapper';

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
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  );
}
