
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/orders/new', label: 'طلب جديد', icon: PlusCircle },
  { href: '/orders', label: 'طلباتي', icon: ListOrdered },
];


export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden"
    )}>
      <nav className="container flex h-16 items-center justify-around px-2">
        {navLinks.map(link => {
          const isActive =
            (link.href === '/dashboard' && pathname === link.href) ||
            (pathname.startsWith(link.href) && link.href !== '/dashboard');
          
          if (link.href === '/orders/new') {
            return (
              <Link href={link.href} className="-mt-8" key={link.href}>
                  <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex flex-col gap-1">
                  <link.icon className="h-6 w-6" />
                  <span className="text-xs">{link.label}</span>
                  </Button>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 transition-colors flex-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
