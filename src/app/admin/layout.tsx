

import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <AdminSidebar pendingOrdersCount={0} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
