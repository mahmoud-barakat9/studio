
'use client';

import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useMediaQuery } from "@/hooks/use-media-query";

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center" dir="ltr">
        {Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                className={cn(
                "h-5 w-5",
                i < rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                )}
            />
        ))}
    </div>
);


export default function AdminReviewsPage() {
  const { orders, users, loading } = useOrdersAndUsers();
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

      {reviewedOrders.length > 0 ? (
        isDesktop ? (
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
                            {reviewedOrders.map((order) => (
                                <TableRow key={order.id}>
                                <TableCell>
                                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                                    {order.orderName}
                                    </Link>
                                </TableCell>
                                <TableCell>{getUserName(order.userId)}</TableCell>
                                <TableCell>
                                    <StarRating rating={order.rating} />
                                </TableCell>
                                <TableCell className="max-w-sm">
                                    <p className="truncate">{order.review}</p>
                                </TableCell>
                                <TableCell>{order.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        ) : (
             <div className="grid gap-4">
                {reviewedOrders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader>
                             <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-base">
                                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                            {order.orderName}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription>
                                        بواسطة: {getUserName(order.userId)}
                                    </CardDescription>
                                </div>
                                <StarRating rating={order.rating} />
                             </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">"{order.review}"</p>
                        </CardContent>
                         <CardFooter className="text-xs text-muted-foreground">
                            بتاريخ: {order.date}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
      ) : (
         <Card>
            <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">لا توجد مراجعات حتى الآن.</p>
            </CardContent>
        </Card>
      )}

    </main>
  );
}
