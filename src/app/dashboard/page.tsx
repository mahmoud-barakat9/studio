

'use client';

import { Dashboard } from "@/components/dashboard/dashboard";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { useEffect, useState } from "react";
import type { User, Order } from "@/lib/definitions";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import { useUser } from "@/hooks/use-user";

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (authLoading) return;
      
      setIsLoading(true);
      if (authUser) {
        const user = await getUserById(authUser.uid);
        if (user) {
          setCurrentUser(user);
          const orders = await getOrdersByUserId(user.id);
          setUserOrders(orders);
        }
      }
      setIsLoading(false);
    }
    fetchUserData();
  }, [authUser, authLoading]);


  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Dashboard 
          currentUser={currentUser}
          userOrders={userOrders}
          isLoading={isLoading || authLoading}
        />
      </main>
      <MainFooter />
    </div>
  );
}

    