
'use client';

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
import type { Order, User } from "@/lib/definitions";
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

interface ReviewsClientPageProps {
    reviewedOrders: (Order & { rating: number; review: string })[];
    users: User[];
}

export function ReviewsClientPage({ reviewedOrders, users }: ReviewsClientPageProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "غير معروف";

  if (reviewedOrders.length === 0) {
      return (
          <Card>
            <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">لا توجد مراجعات حتى الآن.</p>
            </CardContent>
        </Card>
      )
  }

  if (isDesktop) {
      return (
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
                            <TableHead>رقم الطلب</TableHead>
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
                                <TableCell className="font-mono">{order.id}</TableCell>
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
      )
  }

  return (
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
                                  <span>رقم الطلب: </span>
                                  <span className="font-mono text-xs">{order.id}</span>
                              </CardDescription>
                          </div>
                          <StarRating rating={order.rating} />
                       </div>
                  </CardHeader>
                  <CardContent>
                       <div className="text-sm text-muted-foreground mb-4">
                            <span>بواسطة: {getUserName(order.userId)}</span>
                        </div>
                      <p className="text-sm italic">"{order.review}"</p>
                  </CardContent>
                   <CardFooter className="text-xs text-muted-foreground">
                      بتاريخ: {order.date}
                  </CardFooter>
              </Card>
          ))}
      </div>
  )
}
