import { getOrderById, getUsers } from "@/lib/firebase-actions";
import { EditOrderForm } from "@/components/orders/edit-order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


export default async function EditAdminOrderPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrderById(params.orderId);
  const users = await getUsers();

  if (!order) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">لم يتم العثور على الطلب</h1>
                <p className="text-muted-foreground">الطلب الذي تحاول تعديله غير موجود.</p>
                <Link href="/admin/orders">
                    <Button variant="link" className="p-0 mt-4">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى كل الطلبات
                    </Button>
                </Link>
            </div>
        </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold">تعديل الطلب: {order.orderName}</h1>
            <p className="text-muted-foreground">قم بتحديث تفاصيل الطلب أدناه.</p>
        </div>
        <EditOrderForm order={order} users={users} />
    </main>
  );
}
