
'use client';

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Order, User } from "@/lib/definitions";
import { notificationSections } from "./page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function NotificationSection({ title, description, badgeCount, children }: { title: string, description: string, badgeCount: number, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {title}
                    {badgeCount > 0 && <Badge>{badgeCount}</Badge>}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

interface NotificationsClientProps {
    pendingOrders: Order[];
    editRequestOrders: Order[];
    newReviews: Order[];
    users: User[];
}

export function NotificationsClient({ pendingOrders, editRequestOrders, newReviews, users }: NotificationsClientProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const ordersMap = {
    'new-orders': pendingOrders,
    'edit-requests': editRequestOrders,
    'new-reviews': newReviews
  };
  
  const firstOpenSection = notificationSections.find(s => ordersMap[s.id as keyof typeof ordersMap].length > 0)?.id;

  if (isDesktop) {
    return (
        <Tabs defaultValue={firstOpenSection || "new-orders"}>
            <TabsList className="grid w-full grid-cols-3">
                {notificationSections.map(section => (
                    <TabsTrigger key={section.id} value={section.id}>
                        <section.icon className="ml-2 h-4 w-4" />
                        {section.title}
                        {ordersMap[section.id as keyof typeof ordersMap].length > 0 && <Badge className="mr-2">{ordersMap[section.id as keyof typeof ordersMap].length}</Badge>}
                    </TabsTrigger>
                ))}
            </TabsList>

            {notificationSections.map(section => (
                <TabsContent key={section.id} value={section.id}>
                    <NotificationSection 
                        title={section.title} 
                        description={section.description} 
                        badgeCount={ordersMap[section.id as keyof typeof ordersMap].length}
                    >
                        {section.content(ordersMap[section.id as keyof typeof ordersMap], users)}
                    </NotificationSection>
                </TabsContent>
            ))}
        </Tabs>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2" defaultValue={firstOpenSection}>
        {notificationSections.map(section => {
            const sectionOrders = ordersMap[section.id as keyof typeof ordersMap];
            if (sectionOrders.length === 0) return null;

            return (
                <AccordionItem value={section.id} key={section.id}>
                    <AccordionTrigger className="flex rounded-md border bg-card px-4 py-3 text-base font-medium hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                        <div className="flex items-center gap-2">
                            <section.icon className="h-5 w-5" />
                            <span>{section.title}</span>
                            <Badge>{sectionOrders.length}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="border border-t-0 rounded-b-md bg-card p-4">
                        {section.content(sectionOrders, users)}
                    </AccordionContent>
                </AccordionItem>
            )
        })}
    </Accordion>
  );
}
