import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import type { User, Order } from "@/lib/definitions";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import { OrdersTable } from "@/components/orders/orders-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DUMMY_USER_ID = "5"; 

export default async function OrdersPage() {
  const currentUser = await getUserById(DUMMY_USER_ID);
  let userOrders: Order[] = [];
  if (currentUser) {
      userOrders = await getOrdersByUserId(currentUser.id);
  }

  const currentOrders = userOrders.filter(o => !['Delivered', 'Rejected'].includes(o.status) && !o.isArchived);
  const completedOrders = userOrders.filter(o => o.status === 'Delivered' && !o.isArchived);
  const archivedAndRejectedOrders = userOrders.filter(o => o.isArchived || o.status === 'Rejected');

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40">
        <div id="orders" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    طلباتي
                </h1>
                <p className="text-muted-foreground">
                    هنا يمكنك عرض وتتبع جميع طلباتك.
                </p>
                </div>
                 <Link href="/orders/new">
                    <Button>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="current" className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-max">
                  <TabsTrigger value="current">الطلبات الحالية ({currentOrders.length})</TabsTrigger>
                  <TabsTrigger value="completed">الطلبات المكتملة ({completedOrders.length})</TabsTrigger>
                  {archivedAndRejectedOrders.length > 0 && (
                    <TabsTrigger value="archived">المرفوضة والمؤرشفة ({archivedAndRejectedOrders.length})</TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="current">
                <OrdersTable orders={currentOrders} />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersTable orders={completedOrders} />
              </TabsContent>
               {archivedAndRejectedOrders.length > 0 && (
                  <TabsContent value="archived">
                    <OrdersTable orders={archivedAndRejectedOrders} />
                  </TabsContent>
               )}
            </Tabs>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
