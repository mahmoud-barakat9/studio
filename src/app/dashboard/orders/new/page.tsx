import { OrderForm } from "@/components/orders/order-form";

export default function NewOrderPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create a New Order</h1>
        <p className="text-muted-foreground">Fill in the details below to place your order.</p>
      </div>
      <OrderForm />
    </div>
  );
}
