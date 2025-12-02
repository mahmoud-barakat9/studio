
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
  const isNewOrderPage = pathname === '/orders/new';

  return (
    <div id="bottom-nav-portal-container" className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden",
         isNewOrderPage ? "h-24" : "h-16"
    )}>
      <nav className={cn(
          "container flex h-full items-center justify-around px-2"
        )}>
        {navLinks.map(link => {
          // Hide the middle "New Order" link when on the new order page,
          // because the portal will render the submit actions there.
          if (isNewOrderPage && link.href === '/orders/new') {
            return <div key={link.href} className="w-1/3" />
          }

          const isActive =
            (link.href === '/dashboard' && pathname === link.href) ||
            (link.href !== '/dashboard' && pathname.startsWith(link.href));
          
          if (link.href === '/orders/new') {
            return (
              <Link href={link.href} key={link.href} className="-mt-8">
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
