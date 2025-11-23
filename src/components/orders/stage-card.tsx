

'use client';

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, FileQuestion, Factory, Cog, Truck, PackageCheck, CheckCircle2, Loader2, Home } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions";
import type { OrderStatus } from "@/lib/definitions";
import React, { useTransition } from "react";

const icons = {
    FileQuestion,
    Factory,
    Cog,
    Truck,
    PackageCheck,
    CheckCircle2,
    Home,
}
export type StageIconName = keyof typeof icons;


export function StageCard({ stage, isCompleted, isCurrent, isFuture, orderId, showRejectButton = false, onStatusUpdate } : { 
    stage: { name: OrderStatus; label: string; icon: StageIconName, action?: { label: string, nextStatus: OrderStatus } },
    isCompleted: boolean, 
    isCurrent: boolean, 
    isFuture: boolean, 
    orderId: string,
    showRejectButton?: boolean,
    onStatusUpdate: (newStatus: OrderStatus) => Promise<void>;
}) {
    
    const IconComponent = icons[stage.icon];
    const [isPending, startTransition] = useTransition();

    const handleAction = (newStatus: OrderStatus) => {
        startTransition(async () => {
            await onStatusUpdate(newStatus);
        });
    };

    return (
        <Card className={cn(
            isFuture && "bg-muted/50",
            isCurrent && "border-primary ring-2 ring-primary/50"
        )}>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                        isCompleted && "bg-primary text-primary-foreground",
                        isCurrent && "bg-accent text-accent-foreground",
                        isFuture && "bg-secondary text-secondary-foreground",
                    )}>
                        <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{stage.label}</CardTitle>
                        {isCompleted && <CardDescription>اكتملت هذه المرحلة.</CardDescription>}
                        {isCurrent && <CardDescription>هذه هي المرحلة الحالية.</CardDescription>}
                        {isFuture && <CardDescription>مرحلة قادمة.</CardDescription>}
                    </div>
                </div>
                 {isCurrent && stage.action && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {showRejectButton && (
                             <Button variant="destructive" className="w-full" onClick={() => handleAction('Rejected')} disabled={isPending}>
                                {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <X className="ml-2 h-4 w-4" />}
                                رفض الطلب
                            </Button>
                        )}
                        <Button type="button" className="w-full" onClick={() => handleAction(stage.action!.nextStatus)} disabled={isPending}>
                            {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Check className="ml-2 h-4 w-4" />}
                            {stage.action.label}
                        </Button>
                    </div>
                )}
            </CardHeader>
        </Card>
    );
}

    