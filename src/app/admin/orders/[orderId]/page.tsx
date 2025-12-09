

'use client';

import { getOrderById, getUserById } from "@/lib/firebase-actions";
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
import { ArrowRight, FileText, Truck, AlertTriangle, Pencil, BadgeDollarSign, Edit, ExternalLink } from "lucide-react";
import { AdminOrderDetails } from "@/components/orders/admin-order-details";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useEffect, useState } from "react";
import type { Order, User } from "@/lib/definitions";
import { EditPriceDialog } from "@/components/orders/edit-price-dialog";
import { useParams } from "next/navigation";


const DUMMY_ADMIN_ID = "4"; // Admin User ID

async function getOrderAndUsers(orderId: string) {
    const orderData = await getOrderById(orderId);
    const currentUserData = await getUserById(DUMMY_ADMIN_ID);
    let customerData: User | undefined;
    if (orderData) {
        customerData = await getUserById(orderData.userId);
    }
    return { orderData, currentUserData, customerData };
}

function parseDeliveryAddress(address: string) {
    try {
        const parsed = JSON.parse(address);
        return {
            link: parsed.link || '',
            notes: parsed.notes || '',
        };
    } catch (e) {
        // If it's not a valid JSON, it's a plain string address
        return { link: '', notes: address };
    }
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<User | undefined>(undefined);
  
  useEffect(() => {
    async function fetchData() {
        if (!orderId) return;
        const { orderData, currentUserData, customerData } = await getOrderAndUsers(orderId);
        setOrder(orderData);
        setCurrentUser(currentUserData);
        setCustomer(customerData);
    }
    fetchData();
  }, [orderId]);


  if (order === undefined) {
      return (
           <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
               {/* Skeleton loader can be added here */}
               <p>جاري تحميل تفاصيل الطلب...</p>
           </main>
      )
  }

  if (!order) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                لم يتم العثور على الطلب
            </CardTitle>
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

  const finalTotalCost = order.totalCost + (order.deliveryCost || 0);
  const pricePerMeter = order.overriddenPricePerSquareMeter ?? order.pricePerSquareMeter;
  const isEditable = order.status === 'Pending' || order.status === 'Approved';
  const deliveryInfo = order.hasDelivery ? parseDeliveryAddress(order.deliveryAddress) : null;


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {order.status === 'Pending' && (
                    <Link href={`/admin/orders/${order.id}/edit`} className="w-full sm:w-auto">
                        <Button className="w-full">
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل الطلب
                        </Button>
                    </Link>
                )}
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
            <AdminOrderDetails order={order} currentUser={currentUser} setOrder={setOrder} />
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
                          <TableCell>{opening.codeLength}سم</TableCell>
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
                    {order.scheduledDeliveryDate && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">تاريخ التسليم المجدول</span>
                            <span className="font-semibold">{order.scheduledDeliveryDate}</span>
                        </div>
                    )}
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                           <BadgeDollarSign className="h-4 w-4" />
                           سعر المتر
                        </span>
                        <EditPriceDialog
                          order={order}
                          onPriceUpdate={setOrder}
                          isEditable={isEditable}
                        >
                            <div className="flex items-center gap-2 cursor-pointer group">
                                {order.overriddenPricePerSquareMeter && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                                                <Badge variant="secondary">مُعدل</Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>السعر الأصلي: ${order.pricePerSquareMeter.toFixed(2)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                <span className="font-semibold">${pricePerMeter.toFixed(2)}</span>
                                {isEditable && <Edit className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>}
                            </div>
                        </EditPriceDialog>
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
             {deliveryInfo && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Truck className="h-5 w-5" />
                           تفاصيل التوصيل
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            {deliveryInfo.link && (
                                <a href={deliveryInfo.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    فتح رابط الموقع في خرائط جوجل
                                </a>
                            )}
                             {deliveryInfo.notes && (
                                 <div>
                                    <span className="text-muted-foreground text-sm">ملاحظات:</span>
                                    <p className="text-sm font-medium">{deliveryInfo.notes}</p>
                                </div>
                             )}
                              {!deliveryInfo.link && !deliveryInfo.notes && (
                                 <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                             )}
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
