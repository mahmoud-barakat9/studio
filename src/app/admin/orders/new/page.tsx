import { OrderForm } from "@/components/orders/order-form";
import { getUsers } from "@/lib/firebase-actions";

export default async function NewAdminOrderPage() {
  const users = await getUsers();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold">إنشاء طلب جديد لمستخدم</h1>
            <p className="text-muted-foreground">املأ التفاصيل أدناه لتقديم طلب نيابة عن مستخدم.</p>
        </div>
        <OrderForm isAdmin={true} users={users} />
    </main>
  );
}
