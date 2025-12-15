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
  Bell,
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
import { ThemeSwitcher } from '../theme-switcher';
import { NotificationBell } from '../notifications/notification-bell';

const userLinks = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/orders', label: 'طلباتي', icon: ListOrdered },
];

const secondaryLinks = [
  { href: '/admin/dashboard', label: 'تبديل للمسؤول', icon: Shield },
];

export function MainHeader() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  const homeUrl = '/dashboard';
  const DUMMY_USER_ID = "5";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href={homeUrl}
          className="flex items-center gap-2"
        >
          <BrandLogo />
          <span className="font-bold text-lg hidden sm:inline-block">طلب أباجور</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
           <nav className="flex items-center gap-1">
            {userLinks.map(link => (
              <Button key={link.href} variant="ghost" asChild className={cn(
                'text-muted-foreground',
                pathname === link.href && 'text-foreground bg-accent'
              )}>
                <Link href={link.href}>
                  {link.icon && <link.icon />}
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
          
           <Separator orientation="vertical" className="h-6 mx-2" />
           <NotificationBell userId={DUMMY_USER_ID} />
           <Button variant="ghost" asChild>
                <Link href="/welcome">
                    <Home />
                    العودة للرئيسية
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
              <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>مستخدم تجريبي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild><Link href="#"><User className="ml-2 h-4 w-4" />الملف الشخصي</Link></DropdownMenuItem>
                   <DropdownMenuItem asChild><Link href="/admin/dashboard"><Shield className="ml-2 h-4 w-4" />تبديل للمسؤول</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <ThemeSwitcher />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                      <LogOut className="ml-2 h-4 w-4" />
                      تسجيل الخروج
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Mobile Sheet Trigger */}
        <div className="md:hidden flex items-center gap-2">
            <NotificationBell userId={DUMMY_USER_ID} />
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">فتح القائمة</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm p-0">
                    <SheetHeader className="p-6 pb-0">
                        <Link
                            href={homeUrl}
                            className="flex items-center gap-2"
                            onClick={() => setSheetOpen(false)}
                            >
                            <BrandLogo />
                            <span className="font-bold text-lg">طلب أباجور</span>
                        </Link>
                    </SheetHeader>
                    <div className="mt-6 flex h-full flex-col justify-between">
                        <div className="px-4 space-y-4">
                            <div className="flex items-center gap-4 p-2 rounded-lg bg-muted">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={'https://i.pravatar.cc/150?u=user@abjour.com'} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">مستخدم تجريبي</p>
                                    <p className="text-sm text-muted-foreground">user@abjour.com</p>
                                </div>
                            </div>
                            <Separator />
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
                            </nav>
                             <Separator />
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">إعدادات</h3>
                                    <ThemeSwitcher />
                                </div>
                             <Separator />
                                <nav className="flex flex-col gap-2">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">روابط أخرى</h3>
                                    {secondaryLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setSheetOpen(false)}
                                            className="text-muted-foreground hover:text-foreground w-full text-right py-3 px-2 rounded-md flex items-center gap-4 text-md font-medium"
                                        >
                                            {link.icon && <link.icon className="h-5 w-5" />}
                                            {link.label}
                                        </Link>
                                    ))}
                                     <Link
                                        href="/welcome"
                                        onClick={() => setSheetOpen(false)}
                                        className="text-muted-foreground hover:text-foreground w-full text-right py-3 px-2 rounded-md flex items-center gap-4 text-md font-medium"
                                     >
                                        <Home className="h-5 w-5" />
                                        العودة للرئيسية
                                    </Link>
                                </nav>
                        </div>

                        <div className="mt-auto p-4 border-t">
                            <Button variant="outline" className="w-full">
                                <LogOut className="ml-2 h-4 w-4" />
                                تسجيل الخروج
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
