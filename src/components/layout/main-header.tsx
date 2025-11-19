"use client";

import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, User, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getCookie, deleteCookie } from 'cookies-next';
import { getUserById } from "@/lib/firebase-actions";
import type { User as UserType } from "@/lib/definitions";


const guestLinks = [
  { href: "/welcome", label: "الرئيسية" },
  { href: "/welcome#features", label: "المميزات" },
  { href: "/welcome#contact", label: "تواصل معنا" },
];

const userLinks = [
    { href: "/dashboard", label: "لوحة التحكم" },
]


export function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    setIsClient(true);
    const userId = getCookie('session-id');
    if (userId) {
        getUserById(userId).then(user => {
            if (user) {
                setCurrentUser(user);
            } else {
                // Clear cookie if user not found
                deleteCookie('session-id');
                setCurrentUser(null);
            }
        });
    }
  }, []);

  const handleLogout = () => {
    deleteCookie('session-id');
    setCurrentUser(null);
    handleLinkClick();
    router.push('/login');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const links = isLoggedIn && !isAdmin ? userLinks : guestLinks;
  const homeUrl = isLoggedIn && !isAdmin ? "/dashboard" : "/welcome";

  if (!isClient) {
    // Return a placeholder or null to avoid hydration errors
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                 <Link href="/" className="flex items-center gap-2">
                    <BrandLogo />
                    <span className="font-bold text-lg">طلب أباجور</span>
                </Link>
            </div>
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={homeUrl} className="flex items-center gap-2">
          <BrandLogo />
          <span className="font-bold text-lg">طلب أباجور</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                (pathname + (typeof window !== 'undefined' ? window.location.hash : '')) === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${currentUser.email}`} />
                            <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">فتح قائمة المستخدم</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            {isAdmin ? 'حساب المسؤول' : 'حسابي'}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isAdmin ? (
                             <DropdownMenuItem asChild><Link href="/admin/dashboard"><LayoutDashboard className="ml-2 h-4 w-4" />لوحة تحكم المسؤول</Link></DropdownMenuItem>
                        ): (
                            <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="ml-2 h-4 w-4" />لوحة التحكم</Link></DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                           <Link href={isAdmin ? "/admin/profile" : "/"}><User className="ml-2 h-4 w-4" />الملف الشخصي</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    <Button asChild variant="ghost">
                        <Link href="/login">تسجيل الدخول</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">اشتراك</Link>
                    </Button>
                </>
            )}
        </div>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">فتح القائمة</span>
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="container flex flex-col items-center gap-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "text-lg font-medium transition-colors hover:text-primary w-full text-center py-2",
                   (pathname + (typeof window !== 'undefined' ? window.location.hash: '')) === link.href ? "text-primary" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 w-full mt-4 items-center">
               {isLoggedIn && currentUser ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="w-full">
                        <Avatar className="mr-2 h-6 w-6">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${currentUser.email}`} />
                            <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {currentUser.name}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            {isAdmin ? 'حساب المسؤول' : 'حسابي'}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isAdmin ? (
                             <DropdownMenuItem asChild onClick={handleLinkClick}><Link href="/admin/dashboard"><LayoutDashboard className="ml-2 h-4 w-4" />لوحة تحكم المسؤول</Link></DropdownMenuItem>
                        ): (
                            <DropdownMenuItem asChild onClick={handleLinkClick}><Link href="/dashboard"><LayoutDashboard className="ml-2 h-4 w-4" />لوحة التحكم</Link></DropdownMenuItem>
                        )}
                         <DropdownMenuItem asChild onClick={handleLinkClick}>
                           <Link href={isAdmin ? "/admin/profile" : "/"}><User className="ml-2 h-4 w-4" />الملف الشخصي</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
               ) : (
                <>
                    <Button asChild className="w-full" onClick={handleLinkClick} variant="outline">
                      <Link href="/login">تسجيل الدخول</Link>
                    </Button>
                    <Button asChild className="w-full" onClick={handleLinkClick}>
                      <Link href="/register">اشتراك</Link>
                    </Button>
                </>
               )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
