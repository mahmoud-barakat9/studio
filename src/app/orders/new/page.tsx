
'use client';
import { OrderForm } from "@/components/orders/order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import type { User } from "@/lib/definitions";
import { ClientDateTime } from "@/components/client-date-time";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";


export default function NewOrderPage() {
  const { user: currentUser, loading } = useAuth();

   if (loading) {
      return (
           <div className="flex flex-col min-h-screen">
            <MainHeader />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-96 w-full mt-8" />
            </main>
            <MainFooter />
            <BottomNavbar />
           </div>
      )
  }

  return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <main className="flex-1 bg-muted/40 pb-24 md:pb-8">
          <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h1 className="text-2xl font-bold">إنشاء طلب جديد</h1>
                      <p className="text-muted-foreground">املأ التفاصيل أدناه لإنشاء طلبك.</p>
                  </div>
                  <Link href="/dashboard" className="hidden md:inline-block">
                      <Button variant="outline">
                          <ArrowRight className="ml-2 h-4 w-4" />
                          الرجوع إلى لوحة التحكم
                      </Button>
                  </Link>
              </div>
              
              <OrderForm 
                currentUser={currentUser}
                currentDate={<ClientDateTime />}
              />
          </div>
        </main>
        <MainFooter />
        <BottomNavbar />
      </div>
  );
}
