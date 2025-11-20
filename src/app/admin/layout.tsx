
"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { getOrders } from "@/lib/firebase-actions";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/definitions";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const { user, loading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && (!user || user.email !== 'admin@abjour.com')) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    async function fetchOrders() {
        const orders = await getOrders();
        setAllOrders(orders);
        const pendingCount = orders.filter(order => order.status === 'Pending' && !order.isArchived).length;
        setPendingOrdersCount(pendingCount);
    }
    fetchOrders();
  }, []);

  if (loading || !user || user.email !== 'admin@abjour.com') {
      return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <SidebarProvider>
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

    