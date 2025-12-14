
'use client';
import { useState } from "react";
import { OrdersTable } from "@/components/orders/orders-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Order, User } from "@/lib/definitions";
import { Pagination } from "@/components/pagination";

const ITEMS_PER_PAGE = 10;

interface OrdersClientPageProps {
    ordersByStatus: Record<string, Order[]>;
    archivedOrders: Order[];
    users: User[];
    allStatuses: Array<Order['status']>;
    statusTranslations: Record<string, string>;
}

export function OrdersClientPage({ ordersByStatus, archivedOrders, users, allStatuses, statusTranslations }: OrdersClientPageProps) {
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };
  
  const defaultOpenValue = allStatuses.find(status => ordersByStatus[status]?.length > 0) || (archivedOrders.length > 0 ? 'archived' : undefined);

  return (
      <Accordion type="single" collapsible className="w-full space-y-2" defaultValue={defaultOpenValue}>
        {allStatuses.map(status => {
            const ordersForStatus = ordersByStatus[status] || [];
            const currentPage = currentPages[status] || 1;
            const totalPages = Math.ceil(ordersForStatus.length / ITEMS_PER_PAGE);
            const paginatedOrders = ordersForStatus.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        
        {(() => {
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
  );
}
