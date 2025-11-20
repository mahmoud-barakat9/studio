

'use client';

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, FileQuestion, Factory, Cog, Truck, PackageCheck, CheckCircle2 } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions";
import type { OrderStatus } from "@/lib/definitions";
import React from "react";

const icons = {
    FileQuestion,
    Factory,
    Cog,
    Truck,
    PackageCheck,
    CheckCircle2,
}
export type StageIconName = keyof typeof icons;


export function StageCard({ stage, isCompleted, isCurrent, isFuture, orderId, showRejectButton = false } : { 
    stage: { name: OrderStatus; label: string; icon: StageIconName, action?: { label: string, nextStatus: OrderStatus } },
    isCompleted: boolean, 
    isCurrent: boolean, 
    isFuture: boolean, 
    orderId: string,
    showRejectButton?: boolean
}) {
    
    const IconComponent = icons[stage.icon];

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
                    <form action={updateOrderStatus.bind(null, orderId, stage.action!.nextStatus)} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {showRejectButton && (
                             <Button variant="destructive" className="w-full" formAction={updateOrderStatus.bind(null, orderId, 'Rejected')}>
                                <X className="ml-2 h-4 w-4" />
                                رفض الطلب
                            </Button>
                        )}
                        <Button type="submit" className="w-full">
                             <Check className="ml-2 h-4 w-4" />
                            {stage.action.label}
                        </Button>
                    </form>
                )}
            </CardHeader>
        </Card>
    );
}
