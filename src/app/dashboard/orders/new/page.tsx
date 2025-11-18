import { OrderForm } from "@/components/orders/order-form";

export default function NewOrderPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">إنشاء طلب جديد</h1>
        <p className="text-muted-foreground">املأ التفاصيل أدناه لتقديم طلبك.</p>
      </div>
      <OrderForm />
    </div>
  );
}
