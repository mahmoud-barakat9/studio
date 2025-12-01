

import { getOrderById } from "@/lib/firebase-actions";
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
import { ArrowRight, Truck, AlertTriangle } from "lucide-react";
import { OrderTracker } from "@/components/orders/order-tracker";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";


export default async function OrderDetailPage({ params }: { params: { orderId: string }}) {
  const orderId = params.orderId;
  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <main className="flex-1 bg-muted/40">
            <div className="container mx-auto py-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                            لم يتم العثور على الطلب
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>لم نتمكن من العثور على الطلب الذي تبحث عنه.</p>
                        <Link href="/dashboard">
                            <Button variant="link" className="p-0 mt-4">
                                <ArrowRight className="ml-2 h-4 w-4" />
                                العودة إلى لوحة التحكم
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  const finalTotalCost = order.totalCost + (order.deliveryCost || 0);


  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">تفاصيل طلبك</h1>
                    <p className="text-muted-foreground">عرض شامل لكل معلومات طلبك الحالي.</p>
                </div>
                <Link href="/orders">
                    <Button variant="outline">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى كل الطلبات
                    </Button>
                </Link>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>مراحل تتبع الطلب</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <OrderTracker order={order} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                        <CardTitle>تفاصيل القطع</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>نوع التركيب</TableHead>
                                    <TableHead>طول الكود (سم)</TableHead>
                                    <TableHead>عدد الأكواد</TableHead>
                                    <TableHead>إضافات</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {order.openings.map((opening, index) => (
                                    <TableRow key={opening.serial}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{opening.abjourType}</TableCell>
                                    <TableCell>{opening.codeLength}</TableCell>
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
                                <span>{order.mainAbjourType} ({order.mainColor})</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">تاريخ الطلب</span>
                                <span>{order.date}</span>
                            </div>
                             {order.scheduledDeliveryDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">تاريخ التسليم المتوقع</span>
                                    <span className="font-semibold">{order.scheduledDeliveryDate}</span>
                                </div>
                            )}
                            {order.actualDeliveryDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">تاريخ التسليم الفعلي</span>
                                    <span className="font-semibold">{order.actualDeliveryDate}</span>
                                </div>
                            )}
                             <div className="flex items-center justify-between border-t pt-4">
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
                </div>
            </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
