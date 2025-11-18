"use client";

import {
  ClipboardList,
  CheckCircle2,
  Truck,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = [
  {
    name: "Order Placed",
    icon: ClipboardList,
  },
  {
    name: "In Production",
    icon: PackageCheck,
  },
  {
    name: "Shipped",
    icon: Truck,
  },
  {
    name: "Completed",
    icon: CheckCircle2,
  },
] as const;

type OrderStatus = (typeof statuses)[number]["name"];

export function OrderTracker({
  currentStatus,
}: {
  currentStatus: OrderStatus;
}) {
  const currentIndex = statuses.findIndex(
    (status) => status.name === currentStatus
  );

  return (
    <div className="flex items-center w-full">
      {statuses.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={status.name} className="flex items-center w-full relative">
            <div className="flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-accent text-accent-foreground animate-pulse",
                  isFuture && "bg-secondary text-secondary-foreground"
                )}
              >
                <status.icon className="w-6 h-6" />
              </div>
              <p
                className={cn(
                  "text-xs text-center font-medium",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {status.name}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div className="flex-1 h-1 bg-border absolute top-6 left-1/2 w-full">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isCompleted ? "w-full bg-primary" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
