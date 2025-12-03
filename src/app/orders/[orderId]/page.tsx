
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
import { ArrowRight, Truck, AlertTriangle, BadgeDollarSign, Calendar, Hash, Palette, Box } from "lucide-react";
import { OrderTracker } from "@/components/orders/order-tracker";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { Separator } from "@/components/ui/separator";


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
        <BottomNavbar />
      </div>
    );
  }

  const finalTotalCost = order.totalCost + (order.deliveryCost || 0);
  const pricePerMeter = order.overriddenPricePerSquareMeter ?? order.pricePerSquareMeter;


  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 pb-24 md:pb-8">
        <div className="container mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">تفاصيل طلبك</h1>
                    <p className="text-muted-foreground">عرض شامل لكل معلومات طلبك الحالي.</p>
                </div>
                <Link href="/orders" className="hidden md:inline-block">
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
                        <CardDescription>قائمة بالقطع والمواصفات التي طلبتها.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>طول الشفرة (سم)</TableHead>
                                    <TableHead>عدد الشفرات</TableHead>
                                    <TableHead>المساحة (م²)</TableHead>
                                    <TableHead>إضافات</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth) / 10000;
                                    return (
                                        <TableRow key={opening.serial}>
                                            <TableCell className="font-mono">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="font-medium">{opening.numberOfCodes}</TableCell>
                                            <TableCell className="font-mono">{area.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 items-start">
                                                    {opening.hasEndCap && <Badge variant="secondary">غطاء طرفي</Badge>}
                                                    {opening.hasAccessories && <Badge variant="secondary">إكسسوارات</Badge>}
                                                    {!opening.hasEndCap && !opening.hasAccessories && <span className="text-xs text-muted-foreground">-</span>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                </TableBody>
                            </Table>
                        </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-8">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle>{order.orderName}</CardTitle>
                            <div className="text-sm text-muted-foreground pt-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant={
                                        order.status === 'Delivered' ? 'default' :
                                        order.status === 'Rejected' ? 'destructive' :
                                        'secondary'
                                    }>{order.status}</Badge>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-4">
                            <div className="grid gap-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Box /> نوع الأباجور</span>
                                    <span className="font-semibold">{order.mainAbjourType}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Palette /> اللون</span>
                                    <span className="font-semibold">{order.mainColor}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Calendar /> تاريخ الطلب</span>
                                    <span className="font-semibold">{order.date}</span>
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
                            </div>

                            {order.hasDelivery && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2"><Truck /> تفاصيل التوصيل</h4>
                                        <p className="text-sm text-muted-foreground pl-6">{order.deliveryAddress}</p>
                                    </div>
                                </>
                            )}
                            
                            <Separator />
                            
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5"><BadgeDollarSign className="h-4 w-4" /> سعر المتر</span>
                                    <div className="flex items-center gap-2">
                                    {order.overriddenPricePerSquareMeter != null && (
                                        <span className="font-semibold text-sm text-muted-foreground line-through">
                                            ${order.pricePerSquareMeter.toFixed(2)}
                                        </span>
                                    )}
                                    <span className="font-bold text-primary">${pricePerMeter.toFixed(2)}</span>
                                    </div>
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
                                <Separator />
                                <div className="flex items-center justify-between font-bold text-lg">
                                    <span className="text-muted-foreground">الإجمالي</span>
                                    <span className="font-extrabold">${finalTotalCost.toFixed(2)}</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>
      <MainFooter />
      <BottomNavbar />
    </div>
  );
}
