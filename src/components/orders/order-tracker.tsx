'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/definitions';
import { CheckCircle, Truck, Cog, PackageCheck, Factory, FileQuestion, XCircle, Home } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const STAGES: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
    { name: "Pending", label: "تم الاستلام", icon: FileQuestion },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
    { name: "Processing", label: "قيد التجهيز", icon: Cog },
    { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: Truck },
    { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: PackageCheck },
    { name: "Delivered", label: "تم التوصيل", icon: CheckCircle },
];

const PICKUP_STAGES: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
    { name: "Pending", label: "تم الاستلام", icon: FileQuestion },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
    { name: "Processing", label: "قيد التجهيز", icon: Cog },
    { name: "ReadyForDelivery", label: "جاهز للاستلام", icon: Home },
    { name: "Delivered", label: "تم الاستلام", icon: CheckCircle },
];


export function OrderTracker({ order }: { order: Order }) {
  const { status: currentStatus, hasDelivery } = order;
  
  const stagesToShow = hasDelivery ? STAGES : PICKUP_STAGES.filter(stage => STAGES.some(s => s.name === stage.name));
  
  const mainFlowCurrentIndex = STAGES.findIndex(s => s.name === currentStatus);

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
    <TooltipProvider>
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2">
        {stagesToShow.map((stage, index) => {
          const originalIndex = STAGES.findIndex(s => s.name === stage.name);
          
          const isCompleted = originalIndex < mainFlowCurrentIndex;
          const isCurrent = originalIndex === mainFlowCurrentIndex;

          return (
            <React.Fragment key={stage.name}>
              <div className="flex flex-col md:flex-row items-center gap-2 w-full">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border-2',
                            isCompleted ? 'bg-primary border-primary text-primary-foreground' : '',
                            isCurrent ? 'bg-primary/10 border-primary text-primary ring-4 ring-primary/20' : '',
                            !isCompleted && !isCurrent ? 'bg-muted border-border text-muted-foreground' : ''
                            )}
                        >
                            <stage.icon className="w-5 h-5" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{stage.label}</p>
                    </TooltipContent>
                </Tooltip>
                 <div className={cn(
                    "w-full h-1 mt-2 md:mt-0 md:w-full rounded-full transition-colors duration-300",
                    isCompleted ? 'bg-primary' : 'bg-border',
                    index === stagesToShow.length - 1 ? 'hidden md:block' : '',
                     index === stagesToShow.length - 1 && 'bg-transparent'
                 )}></div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
