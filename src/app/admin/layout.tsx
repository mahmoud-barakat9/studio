
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
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    async function fetchOrders() {
        if (user && user.role === 'admin') {
            const orders = await getOrders();
            setAllOrders(orders);
            const pendingCount = orders.filter(order => order.status === 'Pending' && !order.isArchived).length;
            setPendingOrdersCount(pendingCount);
        }
    }
    fetchOrders();
  }, [user]);

  if (loading || !user || user.role !== 'admin') {
      return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
