
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useFormStatus } from 'react-dom';
import React from 'react';

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/orders/new', label: 'طلب جديد', icon: PlusCircle },
  { href: '/orders', label: 'طلباتي', icon: ListOrdered },
];

declare module 'react-dom' {
    function useFormStatus(): {
      pending: boolean;
      data: FormData | null;
      method: 'get' | 'post' | null;
      action: ((formData: FormData) => Promise<void>) | null;
    };
}


export function BottomNavbar() {
  const pathname = usePathname();
  const isNewOrderPage = pathname === '/orders/new';

  return (
    <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden",
        isNewOrderPage && "h-24"
    )}>
      <nav className={cn(
          "container flex h-16 items-center justify-around px-2",
           isNewOrderPage && "h-full"
        )}>
        {navLinks.map(link => {
          const isActive =
            link.href === '/dashboard'
              ? pathname === link.href
              : pathname.startsWith(link.href);
          
          if (isNewOrderPage && link.href === '/orders/new') {
            // This space will be occupied by the form context buttons
            return <div key={link.href} className="w-1/3" />
          }

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
