"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


const guestLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/?create_order=true#create-order", label: "إنشاء طلب" },
  { href: "/#features", label: "المميزات" },
  { href: "/#contact", label: "تواصل معنا" },
];

const userLinks = [
    { href: "/#dashboard", label: "طلباتي" },
]


export function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    setIsClient(true);
    // In a real app, you'd check a session or cookie
    const session = document.cookie.includes('session');
    const role = document.cookie.includes('role=admin') ? 'admin' : 'user';
    setIsLoggedIn(session);
    if(session) {
        setIsAdmin(role === 'admin');
    }
  }, []);


  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const links = isLoggedIn && !isAdmin ? userLinks : guestLinks;

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
        <Link href="/" className="flex items-center gap-2">
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
                (pathname + window.location.hash) === link.href ? "text-primary" : "text-muted-foreground"
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
                            <AvatarImage src={isAdmin ? "https://i.pravatar.cc/150?u=admin" : "https://i.pravatar.cc/150?u=user"} />
                            <AvatarFallback>{isAdmin ? 'A' : 'U'}</AvatarFallback>
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
                             <DropdownMenuItem asChild><Link href="/admin/dashboard">لوحة تحكم المسؤول</Link></DropdownMenuItem>
                        ): (
                            <>
                                <DropdownMenuItem asChild><Link href="/#dashboard">لوحة التحكم</Link></DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                        <Link href="/login">تسجيل الخروج</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    <Link href="/login" passHref>
                        <Button variant="ghost">تسجيل الدخول</Button>
                    </Link>
                    <Link href="#" passHref>
                        <Button>اشتراك</Button>
                    </Link>
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
                   (pathname + window.location.hash) === link.href ? "text-primary" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 w-full mt-4">
               {!isLoggedIn && (
                <>
                    <Link href="/login" passHref>
                        <Button variant="outline" className="w-full" onClick={handleLinkClick}>تسجيل الدخول</Button>
                    </Link>
                    <Link href="#" passHref>
                        <Button className="w-full" onClick={handleLinkClick}>اشتراك</Button>
                    </Link>
                </>
               )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
