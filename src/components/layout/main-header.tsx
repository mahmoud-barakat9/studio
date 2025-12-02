
'use client';

import Link from 'next/link';
import {
  Menu,
  Shield,
  Home,
  ListOrdered,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const userLinks = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/orders', label: 'طلباتي', icon: ListOrdered },
];

const secondaryLinks = [
  { href: '/admin/dashboard', label: 'تبديل للمسؤول', icon: Shield },
  { href: '/welcome', label: 'العودة للرئيسية', icon: Home },
];

export function MainHeader() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  const homeUrl = '/dashboard';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Desktop Logo */}
        <Link
          href={homeUrl}
          className="hidden items-center gap-2 md:flex"
        >
          <BrandLogo />
          <span className="font-bold text-lg">طلب أباجور</span>
        </Link>
        {/* Mobile Logo */}
        <Link
          href={homeUrl}
          className="flex items-center gap-2 md:hidden"
        >
           <BrandLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {userLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Actions for both desktop and triggering mobile sheet */}
        <div className="flex items-center gap-2">
           <div className="hidden md:flex items-center gap-2">
             <Button variant="outline" size="sm" asChild>
                <Link href="/welcome">
                  <Home className="ml-2 h-4 w-4" />
                  الرئيسية
                </Link>
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={'https://i.pravatar.cc/150?u=user@abjour.com'} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">فتح قائمة المستخدم</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>مستخدم تجريبي</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild><Link href="#"><User className="ml-2 h-4 w-4" />الملف الشخصي</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/admin/dashboard"><Shield className="ml-2 h-4 w-4" />تبديل للمسؤول</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
           </div>
          
          {/* Mobile Sheet Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                     <Link
                        href={homeUrl}
                        className="flex items-center gap-2"
                        onClick={() => setSheetOpen(false)}
                        >
                        <BrandLogo />
                        <span className="font-bold text-lg">طلب أباجور</span>
                    </Link>
                </SheetHeader>
                <div className="mt-6 flex flex-col justify-between h-full pb-16">
                    <div>
                        <div className="flex items-center gap-4 p-2 rounded-lg">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={'https://i.pravatar.cc/150?u=user@abjour.com'} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">مستخدم تجريبي</p>
                                <p className="text-sm text-muted-foreground">user@abjour.com</p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <nav className="flex flex-col gap-2">
                             {userLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setSheetOpen(false)}
                                    className={cn(
                                    'text-lg font-medium transition-colors hover:text-primary w-full text-right py-3 px-2 rounded-md flex items-center gap-4',
                                    pathname.startsWith(link.href) ? 'bg-primary/10 text-primary' : 'text-foreground'
                                    )}
                                >
                                    {link.icon && <link.icon className="h-5 w-5" />}
                                    {link.label}
                                </Link>
                            ))}
                            <Separator className="my-4" />
                             {secondaryLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setSheetOpen(false)}
                                    className={cn(
                                    'text-lg font-medium transition-colors hover:text-primary w-full text-right py-3 px-2 rounded-md flex items-center gap-4',
                                    'text-muted-foreground'
                                    )}
                                >
                                    {link.icon && <link.icon className="h-5 w-5" />}
                                    {link.label}
                                </Link>
                             ))}
                        </nav>
                    </div>

                    <Button variant="outline" className="w-full">
                       <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                    </Button>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
