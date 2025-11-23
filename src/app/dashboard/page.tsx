import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Ruler } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import type { User, Order } from "@/lib/definitions";
import { OrdersTable } from "@/components/orders/orders-table";

const DUMMY_USER_ID = "5"; 

export default async function DashboardPage() {
  const currentUser = await getUserById(DUMMY_USER_ID);
  let userOrders: Order[] = [];
  if (currentUser) {
      userOrders = await getOrdersByUserId(currentUser.id);
  }

  const recentOrders = userOrders.slice(0, 5);

  const totalApprovedMeters = userOrders
    .filter(order => order.status !== 'Pending' && order.status !== 'Rejected')
    .reduce((sum, order) => sum + order.totalArea, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid gap-8">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {`أهلاً بك، ${currentUser?.name || 'User'}!`}
                    </h1>
                    <p className="text-muted-foreground">
                        نظرة عامة سريعة على نشاطك.
                    </p>
                </div>
                 <Link href="/orders/new">
                    <Button size="lg">
                        <PlusCircle className="ml-2 h-5 w-5" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardHeader className="pb-4">
                    <CardDescription>إجمالي الأمتار المعتمدة حتى الآن</CardDescription>
                    <CardTitle className="text-4xl flex items-center gap-3">
                    {totalApprovedMeters.toFixed(2)} م²
                    <Ruler className="h-8 w-8 text-primary" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">
                        هذا هو مجموع مساحة جميع طلباتك التي تمت الموافقة عليها. واصل العمل الرائع!
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>آخر الطلبات</CardTitle>
                        <CardDescription>هنا يمكنك عرض آخر 5 طلبات قمت بها.</CardDescription>
                    </div>
                    <Link href="/orders">
                        <Button variant="outline">
                             <ArrowLeft className="ml-2 h-4 w-4" />
                            عرض كل الطلبات
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <OrdersTable orders={recentOrders} />
                </CardContent>
            </Card>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
