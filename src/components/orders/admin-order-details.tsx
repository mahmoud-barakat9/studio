
'use client';
import { useState } from 'react';
import type { Order, OrderStatus, User } from "@/lib/definitions";
import { StageCard, type StageIconName } from "@/components/orders/stage-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from 'lucide-react';
import { updateOrderStatus as updateOrderStatusAction, approveOrder, rejectOrder } from '@/lib/actions';
import { OrderTracker } from './order-tracker';


const DUMMY_USER_ID = "5"; 

export function AdminOrderDetails({ order: initialOrder, currentUser }: { order: Order, currentUser: User | null }) {
    const [order, setOrder] = useState(initialOrder);

    const isOwner = currentUser?.id === order.userId;
    const isAdmin = currentUser?.role === 'admin';

    const handleStatusUpdate = async (newStatus: OrderStatus, orderId: string) => {
        if (!isAdmin) return;

        if (newStatus === 'FactoryOrdered') {
            const result = await approveOrder(orderId);
            if (result.success && result.whatsappUrl) {
                setOrder(prevOrder => ({ ...prevOrder, status: 'FactoryOrdered' }));
                window.open(result.whatsappUrl, '_blank');
            }
        } else if (newStatus === 'Rejected') {
            const result = await rejectOrder(orderId);
            if (result.success && result.whatsappUrl) {
                setOrder(prevOrder => ({ ...prevOrder, status: 'Rejected' }));
                window.open(result.whatsappUrl, '_blank');
            }
        } else {
            setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
            await updateOrderStatusAction(orderId, newStatus);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>مراحل تتبع الطلب</CardTitle>
                <CardDescription>
                    {isAdmin ? "تتبع حالة الطلب وقم بتحديثها." : "تتبع حالة طلبك الحالي."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isAdmin ? (
                     <AdminStageManager order={order} onStatusUpdate={handleStatusUpdate} />
                ) : isOwner ? (
                    <div className="py-4 pr-6">
                         <OrderTracker order={order} />
                    </div>
                ) : (
                    <p>ليس لديك إذن لعرض تفاصيل هذا الطلب.</p>
                )}
            </CardContent>
       </Card>
    )
}


const ADMIN_STAGES: { name: OrderStatus; label: string; icon: StageIconName, action?: { label: string, nextStatus: OrderStatus } }[] = [
    { name: "Pending", label: "بانتظار الموافقة", icon: 'FileQuestion', action: { label: "موافقة وبدء الطلب", nextStatus: "FactoryOrdered" } },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: 'Factory', action: { label: "نقل إلى التجهيز", nextStatus: "Processing" } },
    { name: "Processing", label: "قيد التجهيز", icon: 'Cog', action: { label: "شحن من المعمل", nextStatus: "FactoryShipped" } },
    { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: 'Truck', action: { label: "تأكيد الاستلام وجاهزية التوصيل", nextStatus: "ReadyForDelivery" } },
    { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: 'PackageCheck', action: { label: "تأكيد التوصيل", nextStatus: "Delivered" } },
    { name: "Delivered", label: "تم التوصيل", icon: 'CheckCircle2' },
];

function AdminStageManager({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (newStatus: OrderStatus, orderId: string) => Promise<void> }) {
    const currentStatusIndex = ADMIN_STAGES.findIndex(s => s.name === order.status);

    return (
        <>
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
                ADMIN_STAGES.map((stage, index) => {
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
                                    onStatusUpdate={onStatusUpdate}
                                />
                            );
                        }
                        
                        // Modify "ReadyForDelivery" stage label and action
                        if (stage.name === 'ReadyForDelivery') {
                             const modifiedStage = {
                                ...stage,
                                label: "جاهز للاستلام",
                                icon: 'Home' as StageIconName,
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
                                    onStatusUpdate={onStatusUpdate}
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
                            onStatusUpdate={onStatusUpdate}
                        />
                    );
                })
            )}
        </>
    );
}
