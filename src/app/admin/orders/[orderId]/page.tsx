

import { getOrderById, getUsers } from "@/lib/firebase-actions";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Truck } from "lucide-react";
import type { OrderStatus, Order, User } from "@/lib/definitions";
import { AdminOrderDetails } from "@/components/orders/admin-order-details";

export default async function AdminOrderDetailPage({ params }: { params: { orderId: string } }) {
  const order = await getOrderById(params.orderId);
  const users = await getUsers();

  if (!order) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم نتمكن من العثور على الطلب الذي تبحث عنه.</p>
             <Link href="/admin/orders">
                <Button variant="link" className="p-0 mt-4">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل الطلبات
                </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const customer = users.find((u) => u.id === order.userId);
  const finalTotalCost = order.totalCost + (order.deliveryCost || 0);


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                 <Link href={`/admin/orders/${order.id}/view`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                        <FileText className="ml-2 h-4 w-4" />
                        عرض وتنزيل الفواتير
                    </Button>
                </Link>
                <Link href="/admin/orders" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        كل الطلبات
                    </Button>
                </Link>
            </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow flex flex-col gap-8">
            <AdminOrderDetails order={order} />
           <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفتحات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>نوع التركيب</TableHead>
                        <TableHead>طول الكود</TableHead>
                        <TableHead>عدد الأكواد</TableHead>
                        <TableHead>إضافات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.openings.map((opening, index) => (
                        <TableRow key={opening.serial}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{opening.abjourType}</TableCell>
                          <TableCell>{opening.codeLength}م</TableCell>
                          <TableCell>{opening.numberOfCodes}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {opening.hasEndCap && <Badge variant="secondary">غطاء طرفي</Badge>}
                              {opening.hasAccessories && <Badge variant="secondary">إكسسوارات</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>{order.orderName}</CardTitle>
                    <CardDescription>رقم الطلب: {order.id}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الحالة</span>
                        <span>
                            <Badge variant={
                                order.status === 'Delivered' ? 'default' :
                                order.status === 'Rejected' ? 'destructive' :
                                'secondary'
                            }>{order.status}</Badge>
                        </span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">نوع الأباجور</span>
                        <span>{order.mainAbjourType}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">اللون</span>
                        <span>{order.mainColor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">التاريخ</span>
                        <span>{order.date}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تكلفة المنتجات</span>
                        <span className="font-semibold">${order.totalCost.toFixed(2)}</span>
                    </div>
                    {order.hasDelivery && (
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">تكلفة التوصيل</span>
                            <span className="font-semibold">${(order.deliveryCost || 0).toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
                        <span className="text-muted-foreground">التكلفة الإجمالية</span>
                        <span className="font-extrabold">${finalTotalCost.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
             {order.hasDelivery && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Truck className="h-5 w-5" />
                           تفاصيل التوصيل
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="grid gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-sm">عنوان التوصيل</span>
                            <p className="text-sm font-medium">{order.deliveryAddress}</p>
                        </div>
                    </CardContent>
                </Card>
             )}
            <Card>
                <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الاسم</span>
                        <span className="text-right break-all">{customer?.name ?? order.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني</span>
                        <span className="text-right break-all">{customer?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">رقم الهاتف</span>
                        <span className="text-right break-all">{customer?.phone || order.customerPhone}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}

    