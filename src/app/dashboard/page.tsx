
'use client';

import { Dashboard } from "@/components/dashboard/dashboard";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { useEffect, useState } from "react";
import type { User, Order } from "@/lib/definitions";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";

const DUMMY_USER_ID = "5"; 

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      try {
        const user = await getUserById(DUMMY_USER_ID);
        if (user) {
          setCurrentUser(user);
          const orders = await getOrdersByUserId(user.id);
          setUserOrders(orders);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Dashboard 
          currentUser={currentUser}
          userOrders={userOrders}
          isLoading={isLoading}
        />
      </main>
      <MainFooter />
    </div>
  );
}
