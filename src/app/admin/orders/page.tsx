
'use client';
import { useState } from "react";
import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getOrders, getUsers } from "@/lib/firebase-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order, User } from "@/lib/definitions";
import { Pagination } from "@/components/pagination";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";


const statusTranslations: Record<string, string> = {
  "Pending": "تم الاستلام",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const { orders, users, loading } = useOrdersAndUsers();
  const [currentTabs, setCurrentTabs] = useState<Record<string, number>>({});

  if (loading) {
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
            <div className="space-y-4">
                <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-96 w-full animate-pulse rounded-md bg-muted"></div>
            </div>
        </main>
    );
  }

  const archivedOrders = orders.filter(order => order.isArchived);
  
  const ordersByStatus = (Object.keys(statusTranslations) as Array<Order['status']>).reduce((acc, status) => {
    const filteredOrders = orders.filter(order => order.status === status && !order.isArchived);
    // Always show all status tabs for admin
    acc[status] = filteredOrders;
    return acc;
  }, {} as Record<string, Order[]>);

  const handlePageChange = (tab: string, page: number) => {
    setCurrentTabs(prev => ({ ...prev, [tab]: page }));
  };

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
                {(Object.keys(ordersByStatus) as Array<string>).map(status => (
                    <TabsTrigger key={status} value={status}>
                        {statusTranslations[status]} ({ordersByStatus[status].length})
                    </TabsTrigger>
                ))}
                {archivedOrders.length > 0 && <TabsTrigger value="archived">المؤرشفة ({archivedOrders.length})</TabsTrigger>}
            </TabsList>
        </div>

        {(Object.keys(ordersByStatus) as Array<string>).map(status => {
            const currentPage = currentTabs[status] || 1;
            const totalPages = Math.ceil(ordersByStatus[status].length / ITEMS_PER_PAGE);
            const paginatedOrders = ordersByStatus[status].slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

            return (
             <TabsContent key={status} value={status}>
                <div className="space-y-4">
                    <OrdersTable orders={paginatedOrders} users={users} isAdmin={true} />
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
        
        {archivedOrders.length > 0 && (() => {
            const currentPage = currentTabs['archived'] || 1;
            const totalPages = Math.ceil(archivedOrders.length / ITEMS_PER_PAGE);
            const paginatedOrders = archivedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
            
            return (
                <TabsContent value="archived">
                  <div className="space-y-4">
                    <OrdersTable orders={paginatedOrders} users={users} isAdmin={true} />
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => handlePageChange('archived', page)}
                        />
                    )}
                  </div>
                </TabsContent>
            );
        })()}

      </Tabs>
    </main>
  );
}
