

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/definitions';
import { CheckCircle, Truck, Cog, PackageCheck, Factory, FileQuestion, XCircle, Home, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

const STAGES: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
    { name: "Pending", label: "بانتظار الموافقة", icon: FileQuestion },
    { name: "Approved", label: "تمت الموافقة", icon: CheckCircle2 },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
    { name: "Processing", label: "قيد التجهيز", icon: Cog },
    { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: Truck },
    { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: PackageCheck },
    { name: "Delivered", label: "تم التوصيل", icon: CheckCircle },
];

const PICKUP_STAGES: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
    { name: "Pending", label: "بانتظار الموافقة", icon: FileQuestion },
    { name: "Approved", label: "تمت الموافقة", icon: CheckCircle2 },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
    { name: "Processing", label: "قيد التجهيز", icon: Cog },
    { name: "ReadyForDelivery", label: "جاهز للاستلام", icon: Home },
    { name: "Delivered", label: "تم الاستلام", icon: CheckCircle },
];


export function OrderTracker({ order }: { order: Order }) {
  const { status: currentStatus, hasDelivery } = order;
  
  const stagesToShow = hasDelivery ? STAGES : PICKUP_STAGES;
  
  const mainFlowCurrentIndex = stagesToShow.findIndex(s => s.name === currentStatus);

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
      <div className="flex items-start justify-between w-full gap-1 md:gap-2">
        {stagesToShow.map((stage, index) => {
          const isCompleted = mainFlowCurrentIndex > index;
          const isCurrent = mainFlowCurrentIndex === index;

          return (
            <React.Fragment key={stage.name}>
              <div className="flex flex-col items-center gap-2 text-center w-full">
                  <div
                      className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border-2',
                      isCompleted ? 'bg-primary border-primary text-primary-foreground' : '',
                      isCurrent ? 'bg-primary/10 border-primary text-primary ring-4 ring-primary/20' : '',
                      !isCompleted && !isCurrent ? 'bg-muted border-border text-muted-foreground' : ''
                      )}
                  >
                      <stage.icon className="w-6 h-6" />
                  </div>
                  <p className={cn(
                      'text-xs font-medium',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}>
                      {stage.label}
                  </p>
              </div>

               {index < stagesToShow.length - 1 && (
                 <div className={cn(
                    "flex-1 h-0.5 mt-6 rounded-full transition-colors duration-300",
                    isCompleted || isCurrent ? 'bg-primary' : 'bg-border'
                 )}></div>
               )}
            </React.Fragment>
          );
        })}
      </div>
  );
}
