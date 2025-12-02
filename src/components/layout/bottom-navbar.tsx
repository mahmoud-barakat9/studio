
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useOrderForm } from '../orders/order-form-provider';
import React from 'react';

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/orders/new', label: 'طلب جديد', icon: PlusCircle },
  { href: '/orders', label: 'طلباتي', icon: ListOrdered },
];


export function BottomNavbar() {
  const pathname = usePathname();
  const isNewOrderPage = pathname === '/orders/new';
  const { formActions, showFormActions } = useOrderForm();


  return (
    <div id="bottom-nav-container" className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden"
    )}>
      <nav className="container flex h-16 items-center justify-around px-2">
        {navLinks.map(link => {
          const isActive =
            (link.href === '/dashboard' && pathname === link.href) ||
            (pathname.startsWith(link.href) && link.href !== '/dashboard');
          
          if (link.href === '/orders/new') {
            return (
              <React.Fragment key={link.href}>
                {isNewOrderPage && showFormActions ? (
                    <div id="form-actions-container" className="flex-1 flex items-center justify-between gap-4 h-full px-2" />
                ) : (
                    <Link href={link.href} className="-mt-8">
                        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex flex-col gap-1">
                        <link.icon className="h-6 w-6" />
                        <span className="text-xs">{link.label}</span>
                        </Button>
                    </Link>
                )}
              </React.Fragment>
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
        {formActions}
      </nav>
    </div>
  );
}
