
'use client';
import { useState } from 'react';
import type { Order, OrderStatus } from "@/lib/definitions";
import { StageCard, type StageIconName } from "@/components/orders/stage-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from 'lucide-react';
import { updateOrderStatus as updateOrderStatusAction } from '@/lib/actions';


const STAGES: { name: OrderStatus; label: string; icon: StageIconName, action?: { label: string, nextStatus: OrderStatus } }[] = [
    { name: "Pending", label: "تم الاستلام", icon: 'FileQuestion', action: { label: "موافقة وبدء الطلب", nextStatus: "FactoryOrdered" } },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: 'Factory', action: { label: "نقل إلى التجهيز", nextStatus: "Processing" } },
    { name: "Processing", label: "قيد التجهيز", icon: 'Cog', action: { label: "شحن من المعمل", nextStatus: "FactoryShipped" } },
    { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: 'Truck', action: { label: "تأكيد الاستلام وجاهزية التوصيل", nextStatus: "ReadyForDelivery" } },
    { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: 'PackageCheck', action: { label: "تأكيد التوصيل", nextStatus: "Delivered" } },
    { name: "Delivered", label: "تم التوصيل", icon: 'CheckCircle2' },
];


export function AdminOrderDetails({ order: initialOrder }: { order: Order }) {
    const [order, setOrder] = useState(initialOrder);

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        // Optimistic UI update
        setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
        
        // Call server action
        await updateOrderStatusAction(order.id, newStatus);
    };

    const currentStatusIndex = STAGES.findIndex(s => s.name === order.status);

    return (
        <Card>
            <CardHeader>
                <CardTitle>مراحل تتبع الطلب</CardTitle>
                <CardDescription>تتبع حالة الطلب وقم بتحديثها.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {order.status === 'Rejected' ? (
                     <Card className="border-destructive">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <XCircle className="h-8 w-8 text-destructive" />
                            <div>
                                <CardTitle>الطلب مرفوض</CardTitle>
                                <CardDescription>تم رفض هذا الطلب.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ) : (
                    STAGES.map((stage, index) => {
                        const isCompleted = index < currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const isFuture = index > currentStatusIndex;

                        // Special handling for non-delivery orders
                        if (!order.hasDelivery) {
                            // Skip "FactoryShipped" stage for non-delivery
                            if (stage.name === 'FactoryShipped') return null;

                            // Modify "Processing" stage action
                            if (stage.name === 'Processing') {
                                const modifiedStage = {
                                    ...stage,
                                    action: { label: "جاهز للاستلام", nextStatus: "ReadyForDelivery" as OrderStatus }
                                };
                                return (
                                    <StageCard 
                                        key={modifiedStage.name} 
                                        stage={modifiedStage} 
                                        isCompleted={isCompleted}
                                        isCurrent={isCurrent}
                                        isFuture={isFuture}
                                        orderId={order.id}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                );
                            }
                            
                            // Modify "ReadyForDelivery" stage label and action
                            if (stage.name === 'ReadyForDelivery') {
                                 const modifiedStage = {
                                    ...stage,
                                    label: "جاهز للاستلام",
                                    icon: 'PackageCheck' as StageIconName,
                                    action: { label: "تأكيد الاستلام", nextStatus: "Delivered" as OrderStatus }
                                };
                                return (
                                    <StageCard 
                                        key={modifiedStage.name} 
                                        stage={modifiedStage} 
                                        isCompleted={isCompleted}
                                        isCurrent={isCurrent}
                                        isFuture={isFuture}
                                        orderId={order.id}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                );
                            }
                        }

                        // Default rendering for delivery orders or other stages
                        return (
                            <StageCard 
                                key={stage.name} 
                                stage={stage} 
                                isCompleted={isCompleted}
                                isCurrent={isCurrent}
                                isFuture={isFuture}
                                orderId={order.id}
                                showRejectButton={stage.name === 'Pending'}
                                onStatusUpdate={handleStatusUpdate}
                            />
                        );
                    })
                )}
            </CardContent>
       </Card>
    )
}
