
"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/icons";
import { useState, useEffect } from "react";

export function WelcomeFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const homeUrl = '/welcome';

  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-right">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href={homeUrl} className="flex items-center gap-2 mb-2">
              <BrandLogo />
              <span className="font-bold text-lg text-foreground">طلب أباجور</span>
            </Link>
            <p className="text-sm max-w-xs">
              نظامك المتكامل لإنشاء وتتبع طلبات الأباجور بكفاءة وسهولة.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">أقسام الموقع</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/welcome#features" className="hover:text-primary transition-colors">المميزات</Link>
                <Link href="/welcome#projects" className="hover:text-primary transition-colors">أعمالنا</Link>
                <Link href="/welcome#testimonials" className="hover:text-primary transition-colors">آراء العملاء</Link>
                <Link href="/welcome#contact" className="hover:text-primary transition-colors">تواصل معنا</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">روابط هامة</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">قانوني</h4>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
                <Link href="#" className="hover:text-primary transition-colors">شروط الخدمة</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm">
          {isClient ? <p>&copy; {currentYear} طلب أباجور. جميع الحقوق محفوظة.</p> : <div className="h-6" />}
        </div>
      </div>
    </footer>
  );
}
