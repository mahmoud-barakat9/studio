
import { OrderForm } from "@/components/orders/order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { getUserById } from "@/lib/firebase-actions";
import type { User } from "@/lib/definitions";
import { ClientDateTime } from "@/components/client-date-time";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

const DUMMY_USER_ID = "5"; 

export default async function NewOrderPage() {
  const currentUser = await getUserById(DUMMY_USER_ID);

  return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <main className="flex-1 bg-muted/40 pb-32 md:pb-8">
          <div className="container mx-auto py-8">
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
