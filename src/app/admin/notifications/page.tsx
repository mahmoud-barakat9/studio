
import { getOrders, getUsers } from "@/lib/firebase-actions";
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
import type { Order, User } from "@/lib/definitions";
import { BellRing, CheckCircle, Edit, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NotificationsClient } from "./notifications-client";


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
                    <TableHead>رقم الطلب</TableHead>
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
                        </TableCell>
                        <TableCell className="font-mono">{order.id}</TableCell>
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

export const notificationSections = [
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

export default async function AdminNotificationsPage() {
  const [orders, users] = await Promise.all([getOrders(), getUsers(true)]);

  const editRequestOrders = orders.filter(order => order.isEditRequested && !order.isArchived);
  const pendingOrders = orders.filter(order => order.status === 'Pending' && !order.isArchived);
  const newReviews = orders.filter(order => order.rating && order.review && !order.isArchived);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <BellRing className="h-8 w-8 text-primary" />
        <div>
            <h1 className="font-semibold text-3xl">الإشعارات</h1>
            <p className="text-muted-foreground">عرض التنبيهات والطلبات التي تحتاج إلى انتباهك الفوري.</p>
        </div>
      </div>
      
      <NotificationsClient 
        pendingOrders={pendingOrders}
        editRequestOrders={editRequestOrders}
        newReviews={newReviews}
        users={users}
      />
    </main>
  );
}
