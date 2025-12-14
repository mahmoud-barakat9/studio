

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/definitions';
import { Check, Truck, Cog, PackageCheck, Factory, FileQuestion, XCircle, Home, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

const STAGES: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
    { name: "Pending", label: "بانتظار الموافقة", icon: FileQuestion },
    { name: "Approved", label: "تمت الموافقة", icon: CheckCircle2 },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
    { name: "Processing", label: "قيد التجهيز", icon: Cog },
    { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: Truck },
    { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: PackageCheck },
    { name: "Delivered", label: "تم التوصيل", icon: Check },
];

const PICKUP_STAGES: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
    { name: "Pending", label: "بانتظار الموافقة", icon: FileQuestion },
    { name: "Approved", label: "تمت الموافقة", icon: CheckCircle2 },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
    { name: "Processing", label: "قيد التجهيز", icon: Cog },
    { name: "ReadyForDelivery", label: "جاهز للاستلام", icon: Home },
    { name: "Delivered", label: "تم الاستلام", icon: Check },
];


export function OrderTracker({ order }: { order: Order }) {
  const { status: currentStatus, hasDelivery } = order;
  
  const stagesToShow = hasDelivery ? STAGES : PICKUP_STAGES;
  
  const mainFlowCurrentIndex = stagesToShow.findIndex(s => s.name === currentStatus);
  const progressPercentage = mainFlowCurrentIndex >= 0 ? (mainFlowCurrentIndex / (stagesToShow.length - 1)) * 100 : 0;


  if (currentStatus === 'Rejected') {
    return (
        <Card className="border-destructive bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-4">
                <XCircle className="h-10 w-10 text-destructive" />
                <div>
                    <CardTitle>الطلب مرفوض</CardTitle>
                    <CardDescription>نأسف، لقد تم رفض هذا الطلب. يرجى التواصل معنا لمزيد من المعلومات.</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  return (
    <div className="relative w-full py-4">
      {/* Background Track */}
      <div className="absolute top-1/2 right-0 w-full h-1 bg-border -translate-y-1/2" />
      {/* Progress Track */}
      <div 
        className="absolute top-1/2 right-0 h-1 bg-primary -translate-y-1/2 transition-all duration-500 ease-in-out" 
        style={{ width: `${progressPercentage}%` }}
      />
      
      <div className="relative flex justify-between w-full">
        {stagesToShow.map((stage, index) => {
          const isCompleted = mainFlowCurrentIndex > index;
          const isCurrent = mainFlowCurrentIndex === index;

          return (
            <div className="z-10 flex flex-col items-center gap-2 text-center" key={stage.name}>
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border-2 bg-background',
                  isCompleted ? 'border-primary bg-primary' : 'border-border',
                  isCurrent && 'border-primary bg-accent ring-4 ring-primary/20'
                )}
              >
                <stage.icon className={cn(
                  'w-6 h-6 transition-colors',
                  isCompleted ? 'text-primary-foreground' : 'text-muted-foreground',
                  isCurrent && 'text-primary'
                )} />
              </div>
              <p className={cn(
                'text-xs font-medium max-w-[60px]',
                 (isCompleted || isCurrent) ? 'text-primary' : 'text-muted-foreground'
              )}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
