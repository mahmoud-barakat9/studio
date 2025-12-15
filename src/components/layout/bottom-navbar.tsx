'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, PlusCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useNotifications } from '@/hooks/use-notifications';
import { Badge } from '../ui/badge';

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/orders/new', label: 'طلب جديد', icon: PlusCircle },
  { href: '/notifications', label: 'الإشعارات', icon: Bell, badgeKey: 'notifications' },
  { href: '/orders', label: 'طلباتي', icon: ListOrdered },
];

export function BottomNavbar() {
  const pathname = usePathname();
  const DUMMY_USER_ID = "5"; 
  const { notifications } = useNotifications(DUMMY_USER_ID);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden",
        "pb-[env(safe-area-inset-bottom)]", // Safe area for iOS
    )}>
      <nav className="container flex h-16 items-center justify-around px-2">
        {navLinks.map((link, index) => {
          const isActive = pathname === link.href;
          const isMiddleButton = index === 1;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 transition-colors flex-1 h-full',
                !isMiddleButton && (isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary')
              )}
            >
              {isMiddleButton ? (
                <div className="-mt-8">
                    <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex flex-col gap-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <link.icon className="h-6 w-6" />
                        <span className="text-xs">{link.label}</span>
                    </Button>
                </div>
              ) : (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-1 w-16 h-full rounded-full transition-colors relative",
                    isActive && "bg-primary/10"
                )}>
                    {link.badgeKey === 'notifications' && unreadCount > 0 && (
                        <Badge className="absolute -top-0 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
                    )}
                    <link.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{link.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
