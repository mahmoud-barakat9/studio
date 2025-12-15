'use client';
import { useRouter } from "next/navigation";
import { markNotificationAsRead } from "@/lib/actions";
import type { Notification } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { timeAgo } from "@/lib/time-ago";
import { AlertTriangle, BadgeDollarSign, CheckCircle, Edit, Truck, XCircle } from "lucide-react";

function getNotificationIcon(type: Notification['type']) {
    switch (type) {
        case 'order_approved':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'order_rejected':
            return <XCircle className="h-5 w-5 text-destructive" />;
        case 'order_status_update':
            return <Truck className="h-5 w-5 text-blue-500" />;
        case 'order_price_updated':
            return <BadgeDollarSign className="h-5 w-5 text-yellow-500" />;
        case 'order_edited':
             return <Edit className="h-5 w-5 text-purple-500" />;
        default:
            return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
}


export function NotificationItem({ notification, isDropdown = false }: { notification: Notification, isDropdown?: boolean }) {
    const router = useRouter();

    const handleNotificationClick = async () => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
        }
        router.push(`/orders/${notification.orderId}`);
    };

    const content = (
        <div className="flex items-start gap-3 w-full">
            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(notification.date)}</p>
            </div>
            {!notification.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
            )}
        </div>
    );
    
    if (isDropdown) {
        return (
            <DropdownMenuItem onSelect={handleNotificationClick} className="cursor-pointer">
                {content}
            </DropdownMenuItem>
        );
    }
    
    return (
        <div
            onClick={handleNotificationClick}
            className={cn(
                "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                !notification.isRead && "bg-primary/5"
            )}
        >
            {content}
        </div>
    );
}
