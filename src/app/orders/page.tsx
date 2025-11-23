import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import type { User, Order } from "@/lib/definitions";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/orders-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const DUMMY_USER_ID = "5"; 

export default async function OrdersPage() {
  const currentUser = await getUserById(DUMMY_USER_ID);
  let userOrders: Order[] = [];
  if (currentUser) {
      userOrders = await getOrdersByUserId(currentUser.id);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40">
        <div id="orders" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {`أهلاً بكِ، ${currentUser?.name || 'User'}!`}
                </h1>
                <p className="text-muted-foreground">
                    هنا يمكنك عرض وتتبع جميع طلباتك.
                </p>
                </div>
                 <Link href="/dashboard">
                    <Button>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>كل طلباتك</CardTitle>
                    <CardDescription>هنا يمكنك عرض وإدارة جميع طلباتك.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrdersTable orders={userOrders} showViewAction={true}/>
                </CardContent>
            </Card>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
