import { OrderForm } from "@/components/orders/order-form";
import { getUsers } from "@/lib/firebase-actions";

export default async function NewAdminOrderPage() {
  const users = await getUsers();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold">Create a New Order for a User</h1>
            <p className="text-muted-foreground">Fill in the details below to place an order on behalf of a user.</p>
        </div>
        <OrderForm isAdmin={true} users={users} />
    </main>
  );
}
