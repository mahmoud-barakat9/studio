
'use client';

import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/definitions';
import { CheckCircle, Truck, Cog, PackageCheck, Factory, FileQuestion, XCircle, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';

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
  const { status: currentStatus, hasDelivery, attachments } = order;
  
  // Choose the correct set of stages based on the delivery option
  const stagesToShow = hasDelivery ? STAGES : PICKUP_STAGES.filter(stage => STAGES.some(s => s.name === stage.name));
  
  const currentStatusIndex = stagesToShow.findIndex(s => s.name === currentStatus);

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
    <div className="space-y-8">
      {stagesToShow.map((stage, index) => {
        // Find the original index from the main STAGES array to handle completion status correctly
        const originalIndex = STAGES.findIndex(s => s.name === stage.name);
        const mainFlowCurrentIndex = STAGES.findIndex(s => s.name === currentStatus);
        
        const isCompleted = originalIndex < mainFlowCurrentIndex;
        const isCurrent = originalIndex === mainFlowCurrentIndex;

        const attachmentUrl = attachments?.[stage.name];

        return (
            <div key={stage.name} className="flex items-start gap-4 md:gap-6">
                 <div className="flex flex-col items-center">
                    <div
                        className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border-2',
                        isCompleted ? 'bg-primary border-primary text-primary-foreground' : '',
                        isCurrent ? 'bg-primary/10 border-primary text-primary animate-pulse' : '',
                        !isCompleted && !isCurrent ? 'bg-muted border-border text-muted-foreground' : ''
                        )}
                    >
                        <stage.icon className="w-6 h-6" />
                    </div>
                     {index < stagesToShow.length - 1 && (
                        <div
                            className={cn(
                            'w-0.5 h-16 mt-2 transition-colors duration-300',
                            isCompleted ? 'bg-primary' : 'bg-border'
                            )}
                        />
                    )}
                 </div>

                 <div className={cn("pt-2 w-full", isCurrent ? "opacity-100" : "opacity-70")}>
                    <h3 className={cn("text-lg font-semibold", isCompleted && "text-primary", isCurrent && "text-primary")}>
                        {stage.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {isCompleted && "اكتملت هذه المرحلة."}
                        {isCurrent && "طلبك في هذه المرحلة حاليًا."}
                        {!isCompleted && !isCurrent && "مرحلة قادمة."}
                    </p>
                    {attachmentUrl && (isCurrent || isCompleted) && (
                         <div className="mt-4">
                             <p className="text-sm font-medium mb-2 text-foreground">الصورة المرفقة:</p>
                             <div className="relative aspect-video max-w-xs rounded-md overflow-hidden border-2 border-primary/20">
                                <Image src={attachmentUrl} alt={`صورة مرحلة ${stage.label}`} fill className="object-cover" />
                             </div>
                         </div>
                    )}
                 </div>
            </div>
        );
      })}
    </div>
  );
}
