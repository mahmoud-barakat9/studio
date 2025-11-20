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
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export default function OrderInvoicesPage({
  params,
}: {
  params: { orderId: string };
}) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchData() {
        const orderData = await getOrderById(params.orderId);
        setOrder(orderData);
        if (orderData) {
            const usersData = await getUsers();
            setUsers(usersData);
        }
    }
    fetchData();
  }, [params.orderId]);

  if (order === undefined) {
    return (
      <div className="bg-muted min-h-screen p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <main className="flex h-screen items-center justify-center bg-muted">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>لم يتم العثور على الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم نتمكن من العثور على الطلب الذي تبحث عنه.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const customer = users.find((u) => u.id === order.userId);

  return (
    <div className="bg-muted min-h-screen py-8 sm:py-12" dir="rtl">
        <div className="container mx-auto px-4">
            <Tabs defaultValue="customer" className="max-w-5xl mx-auto">
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
        </div>
    </div>
  );
}