
"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const guestLinks = [
  { href: "/welcome", label: "الرئيسية", id: "home", hash: "" },
  { href: "/welcome#features", label: "المميزات", id: "features", hash: "#features" },
  { href: "/welcome#projects", label: "أعمالنا", id: "projects", hash: "#projects" },
  { href: "/welcome#testimonials", label: "آراء العملاء", id: "testimonials", hash: "#testimonials" },
  { href: "/welcome#contact", label: "تواصل معنا", id: "contact", hash: "#contact" },
];

export function WelcomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    // تحديث الهاش عند التحميل الأولي
    setActiveHash(window.location.hash);

    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    // مستمع للتمرير لتحديث الحالة عند الوصول لأعلى الصفحة
    const handleScroll = () => {
      if (window.scrollY < 100) {
        // إذا كنا في الأعلى ولم نضغط على هاش محدد، نعتبر أننا في "الرئيسية"
        if (!window.location.hash) {
          setActiveHash("");
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLinkClick = (hash: string) => {
    setActiveHash(hash);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link 
          href="/welcome" 
          className="flex items-center gap-2" 
          onClick={() => handleLinkClick("")}
        >
          <BrandLogo />
          <span className="font-bold text-lg">طلب أباجور</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {guestLinks.map((link) => {
            const isActive = activeHash === link.hash;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.hash)}
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
              const isActive = activeHash === link.hash;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleLinkClick(link.hash)}
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
