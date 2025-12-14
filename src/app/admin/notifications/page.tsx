
'use client';

import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { OrdersTable } from "@/components/orders/orders-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, User } from "@/lib/definitions";
import { BellRing, CheckCircle, Edit, Star } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";


function ReviewsTable({ orders, users }: { orders: Order[], users: any[] }) {
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "غير معروف";

    if (orders.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500"/>
                <h3 className="text-lg font-semibold text-foreground">لا توجد مراجعات جديدة</h3>
                <p className="text-sm">لا توجد حاليًا أي مراجعات جديدة من العملاء.</p>
            </div>
        )
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>المراجعة</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                                {order.orderName}
                            </Link>
                            <div className="text-xs text-muted-foreground font-mono">{order.id}</div>
                        </TableCell>
                        <TableCell>{getUserName(order.userId)}</TableCell>
                        <TableCell>
                        <div className="flex items-center" dir="ltr">
                            {Array(5).fill(0).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                "h-5 w-5",
                                order.rating && i < order.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted-foreground"
                                )}
                            />
                            ))}
                        </div>
                        </TableCell>
                        <TableCell className="max-w-sm">
                        <p className="truncate">{order.review}</p>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function NotificationSection({ title, description, badgeCount, children }: { title: string, description: string, badgeCount: number, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {title}
                    {badgeCount > 0 && <Badge>{badgeCount}</Badge>}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

const notificationSections = [
    {
        id: 'new-orders',
        title: 'طلبات جديدة',
        icon: CheckCircle,
        description: 'هذه الطلبات تم إنشاؤها حديثًا وتتطلب موافقتك أو رفضك.',
        content: (orders: Order[], users: User[]) => orders.length > 0 ? (
            <OrdersTable orders={orders} users={users} isAdmin={true} />
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500"/>
                <h3 className="text-lg font-semibold text-foreground">لا توجد طلبات جديدة</h3>
                <p className="text-sm">لا توجد حاليًا طلبات بانتظار الموافقة.</p>
            </div>
        )
    },
    {
        id: 'edit-requests',
        title: 'طلبات تعديل',
        icon: Edit,
        description: 'هذه الطلبات تم الإبلاغ عنها من قبل العملاء وتتطلب مراجعة وتعديلاً.',
        content: (orders: Order[], users: User[]) => orders.length > 0 ? (
            <OrdersTable orders={orders} users={users} isAdmin={true} />
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500"/>
                <h3 className="text-lg font-semibold text-foreground">لا توجد طلبات تعديل</h3>
                <p className="text-sm">لا توجد حاليًا طلبات تعديل معلقة من العملاء.</p>
            </div>
        )
    },
    {
        id: 'new-reviews',
        title: 'مراجعات جديدة',
        icon: Star,
        description: 'عرض جميع تقييمات العملاء على الطلبات المكتملة.',
        content: (orders: Order[], users: User[]) => <ReviewsTable orders={orders} users={users} />
    }
];

export default function AdminNotificationsPage() {
  const { orders, users, loading } = useOrdersAndUsers();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { editRequestOrders, pendingOrders, newReviews } = useMemo(() => {
    const editRequestOrders = orders.filter(order => order.isEditRequested && !order.isArchived);
    const pendingOrders = orders.filter(order => order.status === 'Pending' && !order.isArchived);
    const newReviews = orders.filter(order => order.rating && order.review && !order.isArchived);
    return { editRequestOrders, pendingOrders, newReviews };
  }, [orders]);

  const ordersMap = {
    'new-orders': pendingOrders,
    'edit-requests': editRequestOrders,
    'new-reviews': newReviews
  };


  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }
  
  const firstOpenSection = notificationSections.find(s => ordersMap[s.id as keyof typeof ordersMap].length > 0)?.id;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <BellRing className="h-8 w-8 text-primary" />
        <div>
            <h1 className="font-semibold text-3xl">الإشعارات</h1>
            <p className="text-muted-foreground">عرض التنبيهات والطلبات التي تحتاج إلى انتباهك الفوري.</p>
        </div>
      </div>
      
      {isDesktop ? (
          <Tabs defaultValue={firstOpenSection || "new-orders"}>
            <TabsList className="grid w-full grid-cols-3">
                {notificationSections.map(section => (
                    <TabsTrigger key={section.id} value={section.id}>
                        <section.icon className="ml-2 h-4 w-4" />
                        {section.title}
                        {ordersMap[section.id as keyof typeof ordersMap].length > 0 && <Badge className="mr-2">{ordersMap[section.id as keyof typeof ordersMap].length}</Badge>}
                    </TabsTrigger>
                ))}
            </TabsList>

             {notificationSections.map(section => (
                 <TabsContent key={section.id} value={section.id}>
                    <NotificationSection 
                        title={section.title} 
                        description={section.description} 
                        badgeCount={ordersMap[section.id as keyof typeof ordersMap].length}
                    >
                        {section.content(ordersMap[section.id as keyof typeof ordersMap], users)}
                    </NotificationSection>
                </TabsContent>
            ))}
          </Tabs>
      ) : (
          <Accordion type="single" collapsible className="w-full space-y-2" defaultValue={firstOpenSection}>
            {notificationSections.map(section => {
                const sectionOrders = ordersMap[section.id as keyof typeof ordersMap];
                if (sectionOrders.length === 0) return null;

                return (
                    <AccordionItem value={section.id} key={section.id}>
                        <AccordionTrigger className="flex rounded-md border bg-card px-4 py-3 text-base font-medium hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                            <div className="flex items-center gap-2">
                                <section.icon className="h-5 w-5" />
                                <span>{section.title}</span>
                                <Badge>{sectionOrders.length}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="border border-t-0 rounded-b-md bg-card p-4">
                             {section.content(sectionOrders, users)}
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
      )}

    </main>
  );
}
