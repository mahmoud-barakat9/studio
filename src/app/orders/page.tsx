

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <div className="pt-4">
                      <Skeleton className="h-64 w-full" />
                    </div>
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

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };
  
  const defaultAccordionValue = allStatuses.find(status => ordersByStatus[status]?.length > 0) || (archivedOrders.length > 0 ? 'archived' : undefined);

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

            <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full space-y-4">
              {allStatuses.map(status => {
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
                            <OrdersTable orders={paginatedOrders} />
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
                          <AccordionTrigger className="text-lg font-medium bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg border">
                              الأرشيف ({archivedOrders.length})
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
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
                          </AccordionContent>
                      </AccordionItem>
                  );
              })()}

            </Accordion>
        </div>
      </main>
      <MainFooter />
      <BottomNavbar />
    </div>
  );
}
