import { Dashboard } from "@/components/dashboard/dashboard";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import type { User, Order } from "@/lib/definitions";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";

const DUMMY_USER_ID = "5"; 

export default async function DashboardPage() {
  const currentUser = await getUserById(DUMMY_USER_ID);
  let userOrders: Order[] = [];
  if (currentUser) {
      userOrders = await getOrdersByUserId(currentUser.id);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Dashboard 
          currentUser={currentUser}
          userOrders={userOrders}
        />
      </main>
      <MainFooter />
    </div>
  );
}
