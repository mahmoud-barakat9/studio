
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
import { getOrders, getUsers } from "@/lib/firebase-actions";
import { OrdersClientPage } from "./orders-client-page";

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

export default async function AdminOrdersPage() {
  const [orders, users] = await Promise.all([getOrders(), getUsers(true)]);
  
  const ordersByStatus = allStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status && !order.isArchived);
    return acc;
  }, {} as Record<string, Order[]>);

  const archivedOrders = orders.filter(order => order.isArchived);

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
      
      <OrdersClientPage 
        ordersByStatus={ordersByStatus}
        archivedOrders={archivedOrders}
        users={users}
        allStatuses={allStatuses}
        statusTranslations={statusTranslations}
      />
    </main>
  );
}
