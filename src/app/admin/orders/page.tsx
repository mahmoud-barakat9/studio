
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
  "Approved": "تمت الموافقة",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};

const allStatuses: Array<Order['status']> = [
    "Pending",
    "Approved",
    "FactoryOrdered",
    "Processing",
    "FactoryShipped",
    "ReadyForDelivery",
    "Delivered",
    "Rejected",
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
  
  const allActiveOrders = orders.filter(order => !order.isArchived);

  const ordersByStatus = allStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status && !order.isArchived);
    return acc;
  }, {} as Record<string, Order[]>);

  const archivedOrders = orders.filter(order => order.isArchived);

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };
  
  const defaultOpenValue = "all_active";

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
      
      <Accordion type="single" collapsible className="w-full space-y-2" defaultValue={defaultOpenValue}>
        <AccordionItem value="all_active" className="border-b-0">
            <AccordionTrigger className="flex rounded-md border bg-card px-4 py-3 text-base font-medium hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                <span>كل الطلبات النشطة ({allActiveOrders.length})</span>
            </AccordionTrigger>
            <AccordionContent className="border border-t-0 rounded-b-md bg-card p-0">
                <div className="space-y-4 p-4">
                    <OrdersTable orders={allActiveOrders} users={users} isAdmin={true} />
                    {/* Pagination for all active orders can be added here if needed */}
                </div>
            </AccordionContent>
        </AccordionItem>
        
         {allStatuses.map(status => {
            const ordersForStatus = ordersByStatus[status] || [];
            const currentPage = currentPages[status] || 1;
            const totalPages = Math.ceil(ordersForStatus.length / ITEMS_PER_PAGE);
            const paginatedOrders = ordersForStatus.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
            
            if (ordersForStatus.length === 0) return null;

            return (
              <AccordionItem value={status} key={status} className="border-b-0">
                  <AccordionTrigger className="flex rounded-md border bg-card px-4 py-3 text-base font-medium hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                    <span>{statusTranslations[status]} ({ordersForStatus.length})</span>
                  </AccordionTrigger>
                  <AccordionContent className="border border-t-0 rounded-b-md bg-card p-0">
                      <div className="space-y-4 p-4">
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
        
        {archivedOrders.length > 0 && (() => {
            const currentPage = currentPages['archived'] || 1;
            const totalPages = Math.ceil(archivedOrders.length / ITEMS_PER_PAGE);
            const paginatedOrders = archivedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
            
            return (
                <AccordionItem value="archived" className="border-b-0">
                    <AccordionTrigger className="flex rounded-md border bg-card px-4 py-3 text-base font-medium hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                       <span>الأرشيف ({archivedOrders.length})</span>
                    </AccordionTrigger>
                    <AccordionContent className="border border-t-0 rounded-b-md bg-card p-0">
                        <div className="space-y-4 p-4">
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
