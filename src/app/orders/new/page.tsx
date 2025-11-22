import { OrderForm } from "@/components/orders/order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import type { User, Order } from "@/lib/definitions";
import { ClientDateTime } from "@/components/client-date-time";

const DUMMY_USER_ID = "5"; 

export default async function NewOrderPage() {
  const currentUser = await getUserById(DUMMY_USER_ID);
  let userOrders: Order[] = [];
  if (currentUser) {
      userOrders = await getOrdersByUserId(currentUser.id);
  }

  const totalApprovedMeters = userOrders
    .filter(order => order.status !== 'Pending' && order.status !== 'Rejected')
    .reduce((sum, order) => sum + order.totalArea, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">إنشاء طلب جديد</h1>
                    <p className="text-muted-foreground">املأ التفاصيل أدناه لإنشاء طلبك.</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى لوحة التحكم
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

            <OrderForm 
              currentUser={currentUser}
              currentDate={<ClientDateTime />}
            />
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
