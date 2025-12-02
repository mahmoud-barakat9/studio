
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Ruler, ClipboardList, CheckCircle2 } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import type { User, Order } from "@/lib/definitions";
import { OrdersTable } from "@/components/orders/orders-table";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

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

  const activeOrdersCount = userOrders.filter(order => order.status !== 'Delivered' && order.status !== 'Rejected').length;

  const stats = [
    {
      title: "إجمالي الطلبات",
      value: userOrders.length,
      description: "كل الطلبات التي قمت بإنشائها",
      icon: ClipboardList,
    },
    {
      title: "إجمالي الأمتار المعتمدة",
      value: `${totalApprovedMeters.toFixed(2)} م²`,
      description: "مجموع مساحة طلباتك المكتملة",
      icon: Ruler,
    },
    {
      title: "الطلبات النشطة",
      value: activeOrdersCount,
      description: "الطلبات قيد التنفيذ حاليًا",
      icon: CheckCircle2,
    },
  ];


  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid gap-8">
            
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    {`أهلاً بك، ${currentUser?.name || 'User'}!`}
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    نظرة عامة سريعة على نشاطك. انشئ طلبًا جديدًا أو تتبع طلباتك الحالية من هنا.
                </p>
                 <Link href="/orders/new">
                    <Button size="lg" className="w-full sm:w-auto sm:max-w-xs">
                        <PlusCircle className="ml-2 h-5 w-5" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <div className="md:hidden">
              <Carousel opts={{ align: "start", direction: "rtl" }} className="w-full">
                <CarouselContent className="-ml-2">
                  {stats.map((stat, index) => (
                    <CarouselItem key={index} className="pl-2 basis-4/5">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                          <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="hidden md:grid md:grid-cols-3 gap-4">
               {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>


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
                    <OrdersTable orders={recentOrders} users={currentUser ? [currentUser] : []} />
                </CardContent>
            </Card>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
