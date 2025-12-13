
"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const guestLinks = [
  { href: "/welcome", label: "الرئيسية" },
  { href: "/welcome#features", label: "المميزات" },
  { href: "/welcome#projects", label: "أعمالنا" },
  { href: "/welcome#testimonials", label: "آراء العملاء" },
  { href: "/welcome#contact", label: "تواصل معنا" },
];

export function WelcomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Set initial hash
    setHash(window.location.hash);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const homeUrl = "/welcome";
  const currentPath = pathname + hash;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={homeUrl} className="flex items-center gap-2">
          <BrandLogo />
          <span className="font-bold text-lg">طلب أباجور</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {guestLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                currentPath === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
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
          <div className="container flex flex-col items-center gap-4 py-4">
            {guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "text-lg font-medium transition-colors hover:text-primary w-full text-center py-2",
                   currentPath === link.href ? "text-primary" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
