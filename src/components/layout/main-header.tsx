
"use client";

import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@/hooks/use-user";
import { logout } from "@/lib/actions";
import { Skeleton } from "../ui/skeleton";

const guestLinks = [
  { href: "/welcome", label: "الرئيسية" },
  { href: "/welcome#features", label: "المميزات" },
  { href: "/welcome#contact", label: "تواصل معنا" },
];

const userLinks = [
    { href: "/dashboard", label: "لوحة التحكم" },
    { href: "/dashboard#all-orders-tab", label: "كل طلباتي" },
    { href: "/orders/new", label: "إنشاء طلب جديد" },
]


export function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    handleLinkClick();
    await logout();
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const links = user ? userLinks : guestLinks;
  const homeUrl = user ? "/dashboard" : "/welcome";

  const getAvatarFallback = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  if (loading) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                 <Link href="/" className="flex items-center gap-2">
                    <BrandLogo />
                    <span className="font-bold text-lg">طلب أباجور</span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-24" />
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
            {user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`} />
                            <AvatarFallback>{getAvatarFallback(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">فتح قائمة المستخدم</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="ml-2 h-4 w-4" />لوحة التحكم</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/profile"><UserIcon className="ml-2 h-4 w-4" />الملف الشخصي</Link></DropdownMenuItem>
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
               {user ? (
                    <Button className="w-full" onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
                    </Button>
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

    