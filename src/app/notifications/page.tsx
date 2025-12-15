'use client';
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import type { Notification } from "@/lib/definitions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight, CheckCircle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationItem } from "@/components/notifications/notification-item";
import { markAllNotificationsAsRead } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";


const DUMMY_USER_ID = "5"; 

export default function NotificationsPage() {
    const { notifications, loading, mutate } = useNotifications(DUMMY_USER_ID);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleMarkAllAsRead = async () => {
        startTransition(async () => {
            const result = await markAllNotificationsAsRead(DUMMY_USER_ID);
            if (result.success) {
                mutate(); // Re-fetch notifications
                toast({
                    title: "تم تحديد الكل كمقروء",
                });
            }
        });
    };
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
     return (
       <div className="flex flex-col min-h-screen">
          <MainHeader />
          <main className="flex-1 bg-muted/40 pb-24 md:pb-8">
             <div id="notifications" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
                 <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
            </div>
          </main>
          <MainFooter />
          <BottomNavbar />
      </div>
     )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 pb-24 md:pb-8">
        <div id="notifications" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                      الإشعارات
                  </h1>
                  <p className="text-muted-foreground">
                      هنا يمكنك عرض جميع التنبيهات المتعلقة بطلباتك.
                  </p>
                </div>
                 {unreadCount > 0 && (
                    <Button onClick={handleMarkAllAsRead} disabled={isPending}>
                       <CheckCircle className="ml-2 h-4 w-4" />
                       تحديد الكل كمقروء
                    </Button>
                )}
            </div>
            
            <Card>
                <CardContent className="p-0">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                    ) : (
                         <div className="p-12 text-center text-muted-foreground">
                            <Bell className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">لا توجد إشعارات</h3>
                            <p>لا توجد لديك أي تنبيهات جديدة في الوقت الحالي.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
      </main>
      <MainFooter />
      <BottomNavbar />
    </div>
  );
}
