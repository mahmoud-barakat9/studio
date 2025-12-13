
'use client';
import { useState } from "react";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import type { Order } from "@/lib/definitions";
import { OrdersTable } from "@/components/orders/orders-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Pagination } from "@/components/pagination";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { Skeleton } from "@/components/ui/skeleton";

const DUMMY_USER_ID = "5"; 
const ITEMS_PER_PAGE = 5;

const allStatuses: Array<Order['status']> = [
    "Pending", 
    "Approved", 
    "FactoryOrdered", 
    "Processing", 
    "FactoryShipped", 
    "ReadyForDelivery",
    "Delivered", 
    "Rejected"
];

const statusTranslations: Record<string, string> = {
  "Pending": "بانتظار الموافقة",
  "Approved": "تمت الموافقة",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};

export default function OrdersPage() {
  const { orders: userOrders, loading } = useOrdersAndUsers(DUMMY_USER_ID);
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

  if (loading) {
     return (
       <div className="flex flex-col min-h-screen">
          <MainHeader />
          <main className="flex-1 bg-muted/40 pb-24 md:pb-8">
             <div id="orders" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
                 <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-36 hidden md:block" />
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="pt-4">
                  <Skeleton className="h-64 w-full" />
                </div>
            </div>
          </main>
          <MainFooter />
          <BottomNavbar />
      </div>
     )
  }
  
  const ordersByStatus = allStatuses.reduce((acc, status) => {
    const filteredOrders = userOrders.filter(order => order.status === status && !order.isArchived);
    if (filteredOrders.length > 0) {
      acc[status] = filteredOrders;
    }
    return acc;
  }, {} as Record<string, Order[]>);

  const archivedOrders = userOrders.filter(order => order.isArchived);
  
  const statusTabs = allStatuses.filter(status => ordersByStatus[status]);

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };
  
  const defaultTab = statusTabs.length > 0 ? statusTabs[0] : (archivedOrders.length > 0 ? 'archived' : 'none');

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 pb-24 md:pb-8">
        <div id="orders" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                      طلباتي
                  </h1>
                  <p className="text-muted-foreground">
                      هنا يمكنك عرض وتتبع جميع طلباتك.
                  </p>
                </div>
                 <Link href="/orders/new" className="hidden md:inline-block">
                    <Button>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>
            
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {statusTabs.map(status => (
                        <TabsTrigger key={status} value={status}>
                            {statusTranslations[status]} ({ordersByStatus[status].length})
                        </TabsTrigger>
                    ))}
                    {archivedOrders.length > 0 && (
                        <TabsTrigger value="archived">الأرشيف ({archivedOrders.length})</TabsTrigger>
                    )}
                </TabsList>

                {statusTabs.map(status => {
                     const currentPage = currentPages[status] || 1;
                     const totalPages = Math.ceil(ordersByStatus[status].length / ITEMS_PER_PAGE);
                     const paginatedOrders = ordersByStatus[status].slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                    return (
                        <TabsContent value={status} key={status} className="pt-4">
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
                    )
                })}

                {archivedOrders.length > 0 && (() => {
                    const currentPage = currentPages['archived'] || 1;
                    const totalPages = Math.ceil(archivedOrders.length / ITEMS_PER_PAGE);
                    const paginatedOrders = archivedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                    return (
                        <TabsContent value="archived" className="pt-4">
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
      <BottomNavbar />
    </div>
  );
}
