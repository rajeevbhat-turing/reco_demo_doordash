'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, DollarSign, Star } from 'lucide-react';

export default function DeliverySidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/delivery/dashboard',
      label: 'Home',
      icon: Home,
      isActive: pathname === '/delivery/dashboard' || pathname === '/delivery',
    },
    {
      href: '/delivery/orders',
      label: 'Orders',
      icon: FileText,
      isActive: pathname?.startsWith('/delivery/orders'),
    },
    {
      href: '/delivery/earnings',
      label: 'Earnings',
      icon: DollarSign,
      isActive: pathname?.startsWith('/delivery/earnings'),
    },
    {
      href: '/delivery/ratings',
      label: 'Ratings',
      icon: Star,
      isActive: pathname?.startsWith('/delivery/ratings'),
    },
  ];

  return (
    <aside className="fixed top-16 left-0 w-[220px] border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto bg-white z-40 hidden md:block">
      <nav className="py-4">
        {/* Main Navigation */}
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg mx-2 transition-colors ${
                  item.isActive
                    ? 'bg-[#4561ED]/10 text-[#4561ED] font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
