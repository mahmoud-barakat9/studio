"use client";

import {
  FileQuestion,
  Factory,
  Cog,
  Truck,
  PackageCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainStatuses = [
  { name: "Pending", label: "تم الاستلام", icon: FileQuestion },
  { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: Factory },
  { name: "Processing", label: "قيد التجهيز", icon: Cog },
  { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: Truck },
  { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: PackageCheck },
  { name: "Delivered", label: "تم التوصيل", icon: CheckCircle2 },
] as const;

type OrderStatus = (typeof mainStatuses)[number]["name"] | "Rejected";

export function OrderTracker({
  currentStatus,
}: {
  currentStatus: OrderStatus;
}) {
    const activeStatuses = currentStatus === "Rejected" ?
    [
        { name: "Pending", label: "تم الاستلام", icon: FileQuestion },
        { name: "Rejected", label: "مرفوض", icon: XCircle }
    ]
    : mainStatuses;
    
  const currentIndex = activeStatuses.findIndex(
    (status) => status.name === currentStatus
  );

  return (
    <div className="flex w-full overflow-x-auto p-4">
      <div className="flex items-center w-full min-w-[600px]">
        {activeStatuses.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const isRejected = status.name === 'Rejected' && isCurrent;

          return (
            <div
              key={status.name}
              className="flex items-center w-full relative"
            >
              <div className="flex flex-col items-center gap-2 z-10 w-24">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                    isCompleted && !isRejected && "bg-primary text-primary-foreground",
                    isCurrent && !isRejected && "bg-accent text-accent-foreground animate-pulse",
                    isFuture && "bg-secondary text-secondary-foreground",
                    isRejected && "bg-destructive text-destructive-foreground"
                  )}
                >
                  <status.icon className="w-6 h-6" />
                </div>
                <p
                  className={cn(
                    "text-xs text-center font-medium",
                    (isCompleted || isCurrent)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {status.label}
                </p>
              </div>
              {index < activeStatuses.length - 1 && (
                <div className="flex-1 h-1 bg-border absolute top-6 right-1/2 w-full">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isCompleted && !isRejected ? "w-full bg-primary" : "w-0",
                      isCompleted && activeStatuses[index+1].name === 'Rejected' ? "w-full bg-destructive" : ""
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
