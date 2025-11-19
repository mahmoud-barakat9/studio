"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/icons";
import { useState, useEffect } from "react";
import { getCookie } from 'cookies-next';

export function MainFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
    const session = getCookie('session-id');
    setIsLoggedIn(!!session);
  }, []);

  const homeUrl = isLoggedIn ? '/dashboard' : '/welcome';
  const dashboardUrl = isLoggedIn ? '/dashboard' : '/login';
  const newOrderUrl = isLoggedIn ? '/orders/new' : '/login';

  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href={homeUrl} className="flex items-center gap-2 mb-2">
              <BrandLogo />
              <span className="font-bold text-lg text-foreground">طلب أباجور</span>
            </Link>
            <p className="text-sm max-w-xs text-center md:text-right">
              نظامك المتكامل لإنشاء وتتبع طلبات الأباجور بكفاءة وسهولة.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-center md:text-right">
            <div>
              <h4 className="font-semibold text-foreground mb-2">الشركة</h4>
              <nav className="flex flex-col gap-1">
                <Link href="#" className="hover:text-primary">من نحن</Link>
                <Link href="#" className="hover:text-primary">الوظائف</Link>
                <Link href="#" className="hover:text-primary">الصحافة</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">روابط سريعة</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/login" className="hover:text-primary">تسجيل الدخول</Link>
                <Link href={dashboardUrl} className="hover:text-primary">لوحة التحكم</Link>
                <Link href={newOrderUrl} className="hover:text-primary">طلب جديد</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">قانوني</h4>
              <nav className="flex flex-col gap-1">
                <Link href="#" className="hover:text-primary">سياسة الخصوصية</Link>
                <Link href="#" className="hover:text-primary">شروط الخدمة</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-sm">
          {isClient ? <p>&copy; {currentYear} طلب أباجور. جميع الحقوق محفوظة.</p> : <div className="h-6" />}
        </div>
      </div>
    </footer>
  );
}
