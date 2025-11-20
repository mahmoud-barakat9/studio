
'use client';

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Upload, Image as ImageIcon, FileQuestion, Factory, Cog, Truck, PackageCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
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


export function StageCard({ stage, isCompleted, isCurrent, isFuture, orderId, hasAttachment, attachmentUrl, showRejectButton = false } : { 
    stage: { name: OrderStatus; label: string; icon: StageIconName, action?: { label: string, nextStatus: OrderStatus } },
    isCompleted: boolean, 
    isCurrent: boolean, 
    isFuture: boolean, 
    orderId: string,
    hasAttachment: boolean,
    attachmentUrl?: string | null,
    showRejectButton?: boolean
}) {
    
    // This is a mock action. In a real app, this would trigger a file upload.
    const handleAttachImage = async () => {
        // We create a dummy FormData because the server action expects it, even though we don't use it here.
        const formData = new FormData(); 
        await updateOrderStatus(orderId, stage.name, `https://picsum.photos/seed/${orderId}-${stage.name}/600/400`, formData);
    };

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
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {showRejectButton && (
                            <form action={updateOrderStatus.bind(null, orderId, 'Rejected')}>
                                <Button variant="destructive" className="w-full">
                                    <X className="ml-2 h-4 w-4" />
                                    رفض الطلب
                                </Button>
                            </form>
                        )}
                        <form action={updateOrderStatus.bind(null, orderId, stage.action.nextStatus)}>
                            <Button className="w-full">
                                <Check className="ml-2 h-4 w-4" />
                                {stage.action.label}
                            </Button>
                        </form>
                    </div>
                )}
            </CardHeader>
            {(isCurrent || isCompleted) && (
                <CardContent className="border-t pt-4">
                    {attachmentUrl ? (
                         <div>
                            <p className="text-sm font-medium mb-2">الصورة المرفقة:</p>
                             <div className="relative aspect-video max-w-sm rounded-md overflow-hidden border">
                                <Image src={attachmentUrl} alt={`صورة مرحلة ${stage.label}`} fill className="object-cover" />
                             </div>
                         </div>
                    ) : (
                        <div className="text-center py-4 px-6 border-2 border-dashed rounded-lg">
                           <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                           <p className="mt-2 text-sm text-muted-foreground">لم يتم إرفاق صورة لهذه المرحلة.</p>
                           {isCurrent && (
                               <Button type="button" onClick={handleAttachImage} variant="outline" className="mt-4">
                                   <Upload className="ml-2 h-4 w-4" />
                                   إرفاق صورة (وهمي)
                               </Button>
                           )}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
