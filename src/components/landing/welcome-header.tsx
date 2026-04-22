
"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const guestLinks = [
  { href: "/welcome", label: "الرئيسية", id: "home" },
  { href: "/welcome#features", label: "المميزات", id: "features" },
  { href: "/welcome#projects", label: "أعمالنا", id: "projects" },
  { href: "/welcome#testimonials", label: "آراء العملاء", id: "testimonials" },
  { href: "/welcome#contact", label: "تواصل معنا", id: "contact" },
];

export function WelcomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setHash] = useState("");

  useEffect(() => {
    // تحديث الحالة عند تغيير الهاش في الرابط
    const handleHashChange = () => {
      setHash(window.location.hash || "");
    };

    // التحديث عند التحميل الأولي
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    
    // إضافة مستمع للتمرير لتحديث الهاش يدوياً إذا لزم الأمر
    const handleScroll = () => {
        if (window.scrollY < 100) {
            setHash("");
        }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const homeUrl = "/welcome";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={homeUrl} className="flex items-center gap-2">
          <BrandLogo />
          <span className="font-bold text-lg">طلب أباجور</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {guestLinks.map((link) => {
            // منطق تحديد الرابط النشط:
            // 1. إذا لم يكن هناك هاش والاسم هو الرئيسية
            // 2. إذا كان الهاش الحالي يطابق نهاية الرابط
            const linkHash = link.href.includes('#') ? '#' + link.href.split('#')[1] : "";
            const isActive = (activeHash === "" && link.href === "/welcome") || 
                             (activeHash !== "" && activeHash === linkHash);
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
                {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
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
          <div className="container flex flex-col items-center gap-4 py-4 bg-background border-b shadow-lg">
            {guestLinks.map((link) => {
              const linkHash = link.href.includes('#') ? '#' + link.href.split('#')[1] : "";
              const isActive = (activeHash === "" && link.href === "/welcome") || 
                               (activeHash !== "" && activeHash === linkHash);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary w-full text-center py-3 rounded-md",
                     isActive ? "text-primary bg-primary/10" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
