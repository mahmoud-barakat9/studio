
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn, PlusCircle, LayoutDashboard } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "../ui/skeleton";

export function Hero() {
  const { user, loading } = useAuth();
  const heroImage = PlaceHolderImages.find(img => img.id === 'login-background');
  
  const dashboardUrl = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
  const buttonText = user?.role === 'admin' ? 'اذهب إلى لوحة التحكم' : 'اذهب إلى لوحة التحكم';
  const ButtonIcon = user?.role === 'admin' ? LayoutDashboard : PlusCircle;


  return (
    <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-white text-center bg-gray-900 -mx-4 md:mx-0">
      <div className="absolute inset-0">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 p-4 container mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">
          أباجورك المثالي، بخطوات بسيطة
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 drop-shadow">
          نظام متكامل وسهل لإدارة طلبات الأباجور، من التصميم إلى التسليم.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {loading ? (
            <Skeleton className="h-12 w-64 rounded-md" />
          ) : user ? (
             <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={dashboardUrl}>
                  <LayoutDashboard className="ml-2 h-5 w-5" />
                  {buttonText}
                </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/orders/new">
                  <PlusCircle className="ml-2 h-5 w-5" />
                  أنشئ طلبك الآن
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/login">
                  <LogIn className="ml-2 h-5 w-5" />
                  تسجيل الدخول
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
