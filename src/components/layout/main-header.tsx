
"use client";

import Link from "next/link";
import { Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const userLinks = [
    { href: "/dashboard", label: "لوحة التحكم" },
    { href: "/dashboard#all-orders-tab", label: "كل طلباتي" },
    { href: "/orders/new", label: "إنشاء طلب جديد" },
]


export function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const homeUrl = "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={homeUrl} className="flex items-center gap-2">
          <BrandLogo />
          <span className="font-bold text-lg">طلب أباجور</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {userLinks.map((link) => (
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
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/150?u=user@abjour.com`} />
                      <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">فتح قائمة المستخدم</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuLabel>مستخدم تجريبي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/admin/dashboard"><Shield className="ml-2 h-4 w-4" />تبديل للمسؤول</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/welcome">
                      العودة للرئيسية
                    </Link>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
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
            {userLinks.map((link) => (
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
               <Button asChild className="w-full" variant="outline" onClick={handleLinkClick}>
                  <Link href="/admin/dashboard"><Shield className="ml-2 h-4 w-4" />تبديل للمسؤول</Link>
               </Button>
               <Button asChild className="w-full" onClick={handleLinkClick}>
                  <Link href="/welcome">العودة للرئيسية</Link>
               </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
