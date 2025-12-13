
'use client';
import { useState } from "react";
import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Order } from "@/lib/definitions";
import { Pagination } from "@/components/pagination";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";


const statusTranslations: Record<string, string> = {
  "Pending": "بانتظار الموافقة",
  "Approved": "جاهزة للإرسال للمعمل",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};

const activeStatuses: Array<Order['status']> = [
    "Pending", 
    "Approved", 
    "FactoryOrdered", 
    "Processing", 
    "FactoryShipped", 
    "ReadyForDelivery"
];

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const { orders, users, loading } = useOrdersAndUsers();
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

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
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
    );
  }

  const finishedOrders = orders.filter(order => 
      order.isArchived || order.status === 'Delivered' || order.status === 'Rejected'
  );
  
  const ordersByStatus = activeStatuses.reduce((acc, status) => {
    const filteredOrders = orders.filter(order => order.status === status && !order.isArchived);
    if (filteredOrders.length > 0) {
      acc[status] = filteredOrders;
    }
    return acc;
  }, {} as Record<string, Order[]>);

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };
  
  const defaultAccordionValue = activeStatuses.find(status => ordersByStatus[status]?.length > 0) || (finishedOrders.length > 0 ? 'archived' : undefined);


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
      
      <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full space-y-4">
        {activeStatuses.map(status => {
            if (!ordersByStatus[status]) return null;

            const currentPage = currentPages[status] || 1;
            const totalPages = Math.ceil(ordersByStatus[status].length / ITEMS_PER_PAGE);
            const paginatedOrders = ordersByStatus[status].slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

            return (
              <AccordionItem value={status} key={status} className="border-b-0">
                <AccordionTrigger className="text-lg font-medium bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg border">
                  {statusTranslations[status]} ({ordersByStatus[status].length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
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
                </AccordionContent>
              </AccordionItem>
            );
        })}
        
        {finishedOrders.length > 0 && (() => {
            const currentPage = currentPages['archived'] || 1;
            const totalPages = Math.ceil(finishedOrders.length / ITEMS_PER_PAGE);
            const paginatedOrders = finishedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
            
            return (
                <AccordionItem value="archived" className="border-b-0">
                    <AccordionTrigger className="text-lg font-medium bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg border">
                        الأرشيف ({finishedOrders.length})
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
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
                    </AccordionContent>
                </AccordionItem>
            );
        })()}

      </Accordion>
    </main>
  );
}
