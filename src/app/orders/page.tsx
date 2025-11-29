
'use client';
import { useState } from "react";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import type { Order } from "@/lib/definitions";
import { OrdersTable } from "@/components/orders/orders-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Pagination } from "@/components/pagination";

const DUMMY_USER_ID = "5"; 
const ITEMS_PER_PAGE = 5;

const statusTranslations: Record<string, string> = {
  "Pending": "بانتظار الموافقة",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};

export default function OrdersPage() {
  const { orders: allOrders, loading } = useOrdersAndUsers(DUMMY_USER_ID);
  const [currentTabs, setCurrentTabs] = useState<Record<string, number>>({});

  if (loading) {
     return (
       <div className="flex flex-col min-h-screen">
          <MainHeader />
          <main className="flex-1 bg-muted/40">
             <div id="orders" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
                 <div className="flex items-center justify-between">
                    <div className="h-16 w-1/3 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-10 w-36 animate-pulse rounded-md bg-muted"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                    <div className="h-96 w-full animate-pulse rounded-md bg-muted"></div>
                </div>
            </div>
          </main>
          <MainFooter />
      </div>
     )
  }

  const userOrders = allOrders.filter(o => o.userId === DUMMY_USER_ID);

  const ordersByStatus = (Object.keys(statusTranslations) as Array<Order['status']>).reduce((acc, status) => {
    const filteredOrders = userOrders.filter(order => order.status === status && !order.isArchived);
    if(filteredOrders.length > 0){
        acc[status] = filteredOrders;
    }
    return acc;
  }, {} as Record<string, Order[]>);
  
  const archivedOrders = userOrders.filter(order => order.isArchived);
  const rejectedOrders = userOrders.filter(order => order.status === 'Rejected' && !order.isArchived);
  const archivedAndRejectedOrders = [...archivedOrders, ...rejectedOrders];

  const handlePageChange = (tab: string, page: number) => {
    setCurrentTabs(prev => ({ ...prev, [tab]: page }));
  };

  const defaultTab = Object.keys(ordersByStatus)[0] || (archivedAndRejectedOrders.length > 0 ? 'archived' : '');


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

            <Tabs defaultValue={defaultTab} className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-max">
                  {Object.keys(ordersByStatus).map(status => (
                    <TabsTrigger key={status} value={status}>
                      {statusTranslations[status]} ({ordersByStatus[status].length})
                    </TabsTrigger>
                  ))}
                  {archivedAndRejectedOrders.length > 0 && <TabsTrigger value="archived">المؤرشفة والمرفوضة ({archivedAndRejectedOrders.length})</TabsTrigger>}
                </TabsList>
              </div>

              {Object.keys(ordersByStatus).map(status => {
                const currentPage = currentTabs[status] || 1;
                const totalPages = Math.ceil(ordersByStatus[status].length / ITEMS_PER_PAGE);
                const paginatedOrders = ordersByStatus[status].slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                return (
                    <TabsContent key={status} value={status}>
                        <div className="space-y-4">
                            <OrdersTable orders={paginatedOrders} />
                            {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => handlePageChange(status, page)}
                                />
                            )}
                        </div>
                    </TabsContent>
                );
              })}

              {archivedAndRejectedOrders.length > 0 && (() => {
                  const currentPage = currentTabs['archived'] || 1;
                  const totalPages = Math.ceil(archivedAndRejectedOrders.length / ITEMS_PER_PAGE);
                  const paginatedOrders = archivedAndRejectedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                  return (
                    <TabsContent value="archived">
                        <div className="space-y-4">
                            <OrdersTable orders={paginatedOrders} />
                            {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => handlePageChange('archived', page)}
                                />
                            )}
                        </div>
                    </TabsContent>
                  )
              })()}
            </Tabs>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
