import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getOrders, getUsers } from "@/lib/firebase-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order } from "@/lib/definitions";

const statusTranslations: Record<Order['status'], string> = {
  "Pending": "تم الاستلام",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const users = await getUsers();

  const archivedOrders = orders.filter(order => order.isArchived);
  
  const ordersByStatus = (Object.keys(statusTranslations) as Array<Order['status']>).reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status && !order.isArchived);
    return acc;
  }, {} as Record<Order['status'], Order[]>);
  

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">كل الطلبات</h1>
        <div className="mr-auto flex items-center gap-2">
            <Link href="/admin/orders/new">
                <Button size="sm">
                <PlusCircle className="h-4 w-4 ml-2" />
                إنشاء طلب
                </Button>
            </Link>
        </div>
      </div>
      
      <Tabs defaultValue="Pending" className="w-full">
        <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max">
                {(Object.keys(ordersByStatus) as Array<Order['status']>).map(status => (
                    <TabsTrigger key={status} value={status}>
                        {statusTranslations[status]} ({ordersByStatus[status].length})
                    </TabsTrigger>
                ))}
                <TabsTrigger value="archived">المؤرشفة ({archivedOrders.length})</TabsTrigger>
            </TabsList>
        </div>

        {(Object.keys(ordersByStatus) as Array<Order['status']>).map(status => (
             <TabsContent key={status} value={status}>
                <OrdersTable orders={ordersByStatus[status]} users={users} isAdmin={true} />
             </TabsContent>
        ))}

        <TabsContent value="archived">
          <OrdersTable orders={archivedOrders} users={users} isAdmin={true} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
