

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

  const orders = await getOrders();
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' && !o.isArchived).length;
  const newReviewsCount = orders.filter(o => o.rating && o.review).length;
  const editRequestsCount = orders.filter(o => o.isEditRequested).length;


  return (
    <SidebarProvider>
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} newReviewsCount={newReviewsCount} editRequestsCount={editRequestsCount} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
