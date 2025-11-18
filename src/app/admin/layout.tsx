import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { getOrders } from "@/lib/firebase-actions";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allOrders = await getOrders();
  const pendingOrdersCount = allOrders.filter(order => order.status === 'Pending Approval').length;

  return (
    <SidebarProvider>
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
