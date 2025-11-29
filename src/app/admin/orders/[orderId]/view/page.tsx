'use client';

import { getOrderById, getUsers } from "@/lib/firebase-actions";
import { CustomerInvoice } from "@/components/invoices/customer-invoice";
import { FactoryInvoice } from "@/components/invoices/factory-invoice";
import { DeliveryInvoice } from "@/components/invoices/delivery-invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadInvoiceButton } from "@/components/orders/download-invoice-button";
import type { Order, User } from "@/lib/definitions";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


async function getOrderAndUsers(orderId: string) {
    const orderData = await getOrderById(orderId);
    let usersData: User[] = [];
    if (orderData) {
        usersData = await getUsers();
    }
    return { orderData, usersData };
}


export default function OrderInvoicesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  
  const initialTab = searchParams.get('type') || 'customer';
  
  const [data, setData] = useState<{orderData: Order | null | undefined, usersData: User[]}>({ orderData: undefined, usersData: [] });

  useEffect(() => {
    async function fetchData() {
        if (!orderId) return;
        const { orderData, usersData } = await getOrderAndUsers(orderId);
        setData({ orderData, usersData });
    }
    fetchData();
  }, [orderId]);

  const { orderData: order, usersData: users } = data;

  if (order === undefined) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-96 w-full" />
      </main>
    );
  }
  
  if (!order) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>لم يتم العثور على الطلب</CardTitle>
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

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue={initialTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold">فواتير الطلب: {order.orderName}</h1>
                    <p className="text-muted-foreground">اختر الفاتورة المطلوبة لعرضها أو تنزيلها كصورة.</p>
                </div>
                 <TabsList className="grid w-full sm:w-auto grid-cols-3">
                    <TabsTrigger value="customer">فاتورة العميل</TabsTrigger>
                    <TabsTrigger value="factory">فاتورة المعمل</TabsTrigger>
                    <TabsTrigger value="delivery" disabled={!order.hasDelivery}>فاتورة التوصيل</TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="customer">
                 <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>فاتورة العميل النهائية</CardTitle>
                        <DownloadInvoiceButton invoiceId="customer-invoice" orderId={order.id} type="customer" />
                    </CardHeader>
                    <CardContent>
                        <CustomerInvoice order={order} customer={customer} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="factory">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>فاتورة المعمل الفنية</CardTitle>
                        <DownloadInvoiceButton invoiceId="factory-invoice" orderId={order.id} type="factory" />
                    </CardHeader>
                    <CardContent>
                         <FactoryInvoice order={order} />
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="delivery">
                <Card>
                     <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>فاتورة مسؤول التوصيل</CardTitle>
                        <DownloadInvoiceButton invoiceId="delivery-invoice" orderId={order.id} type="delivery" />
                    </CardHeader>
                    <CardContent>
                       <DeliveryInvoice order={order} customer={customer} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </main>
  );
}
