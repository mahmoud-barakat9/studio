
import { OrderForm } from "@/components/orders/order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";


export default function NewOrderPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">إنشاء طلب جديد</h1>
                    <p className="text-muted-foreground">املأ التفاصيل أدناه لإنشاء طلبك.</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى لوحة التحكم
                    </Button>
                </Link>
            </div>
            <OrderForm />
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
