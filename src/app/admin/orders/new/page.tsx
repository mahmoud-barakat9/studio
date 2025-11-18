import { OrderForm } from "@/components/orders/order-form";
import { getUsers } from "@/lib/firebase-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function NewAdminOrderPage() {
  const users = await getUsers();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold">إنشاء طلب جديد لمستخدم</h1>
                <p className="text-muted-foreground">املأ التفاصيل أدناه لتقديم طلب نيابة عن مستخدم.</p>
            </div>
             <Link href="/admin/orders">
                <Button variant="outline">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل الطلبات
                </Button>
            </Link>
        </div>
        <OrderForm isAdmin={true} users={users} />
    </main>
  );
}
