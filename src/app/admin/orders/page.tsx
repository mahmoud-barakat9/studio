import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getOrders, getUsers } from "@/lib/firebase-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const users = await getUsers();

  const rejectedOrders = orders.filter(order => order.status === 'Rejected' && !order.isArchived);
  const archivedOrders = orders.filter(order => order.isArchived);
  const activeOrders = orders.filter(order => !order.isArchived && order.status !== 'Rejected');


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
      
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">الطلبات النشطة ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="rejected">الطلبات المرفوضة ({rejectedOrders.length})</TabsTrigger>
          <TabsTrigger value="archived">الطلبات المؤرشفة ({archivedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <OrdersTable orders={activeOrders} users={users} isAdmin={true} />
        </TabsContent>
         <TabsContent value="rejected">
          <OrdersTable orders={rejectedOrders} users={users} isAdmin={true} />
        </TabsContent>
        <TabsContent value="archived">
          <OrdersTable orders={archivedOrders} users={users} isAdmin={true} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
