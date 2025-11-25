
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

  const currentOrders = userOrders.filter(o => !['Delivered', 'Rejected'].includes(o.status) && !o.isArchived);
  const completedOrders = userOrders.filter(o => o.status === 'Delivered' && !o.isArchived);
  const archivedAndRejectedOrders = userOrders.filter(o => o.isArchived || o.status === 'Rejected');

  const tabsData = {
    current: currentOrders,
    completed: completedOrders,
    archived: archivedAndRejectedOrders,
  };

  const handlePageChange = (tab: string, page: number) => {
    setCurrentTabs(prev => ({ ...prev, [tab]: page }));
  };

  const renderTabContent = (tabKey: keyof typeof tabsData, tabName: string) => {
    const orders = tabsData[tabKey];
    
    if (orders.length === 0 && tabKey === 'archived') {
      return null;
    }

    return (
      <TabsTrigger value={tabKey}>{tabName} ({orders.length})</TabsTrigger>
    );
  };
  
  const renderOrdersTable = (tabKey: keyof typeof tabsData) => {
    const orders = tabsData[tabKey];
    const currentPage = currentTabs[tabKey] || 1;
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <TabsContent value={tabKey}>
            <div className="space-y-4">
                <OrdersTable orders={paginatedOrders} />
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => handlePageChange(tabKey, page)}
                    />
                )}
            </div>
        </TabsContent>
    )
  }


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
                  {renderTabContent('current', 'الطلبات الحالية')}
                  {renderTabContent('completed', 'الطلبات المكتملة')}
                  {renderTabContent('archived', 'المرفوضة والمؤرشفة')}
                </TabsList>
              </div>

              {renderOrdersTable('current')}
              {renderOrdersTable('completed')}
              {tabsData.archived.length > 0 && renderOrdersTable('archived')}
            </Tabs>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
