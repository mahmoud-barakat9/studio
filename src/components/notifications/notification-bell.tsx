'use client';

import { Bell, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "../ui/badge";
import { NotificationItem } from "./notification-item";

export function NotificationBell({ userId }: { userId: string }) {
  const { notifications, loading } = useNotifications(userId);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentUnreadNotifications = notifications.filter(n => !n.isRead).slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
          )}
          <span className="sr-only">فتح الإشعارات</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <DropdownMenuItem disabled>جاري التحميل...</DropdownMenuItem>
          ) : recentUnreadNotifications.length > 0 ? (
            recentUnreadNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} isDropdown />
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
              لا توجد إشعارات جديدة
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuFooter>
            <Button variant="ghost" className="w-full justify-center" asChild>
                <Link href="/notifications">عرض كل الإشعارات</Link>
            </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
