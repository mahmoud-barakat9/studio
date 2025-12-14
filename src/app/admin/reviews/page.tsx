
'use client';

import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
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
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/definitions";
import { useMemo } from "react";

export default function AdminReviewsPage() {
  const { orders, users, loading } = useOrdersAndUsers();

  const reviewedOrders = useMemo(() => {
    return orders
      .filter((order): order is Order & { rating: number; review: string } => 
        typeof order.rating === 'number' && typeof order.review === 'string'
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders]);
  
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "غير معروف";

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <Skeleton className="h-10 w-48" />
        </div>
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

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">مراجعات العملاء</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة المراجعات</CardTitle>
          <CardDescription>عرض جميع تقييمات العملاء على الطلبات المكتملة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>المراجعة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedOrders.length > 0 ? (
                  reviewedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                          {order.orderName}
                        </Link>
                      </TableCell>
                      <TableCell>{getUserName(order.userId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center" dir="ltr">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-5 w-5",
                                i < order.rating
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
                      <TableCell>{order.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا توجد مراجعات حتى الآن.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
