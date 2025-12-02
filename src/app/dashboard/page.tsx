
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

  const StatCard = ({ stat }: { stat: typeof stats[0] }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{stat.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <div className="text-4xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
        </CardContent>
    </Card>
  );


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
                <CarouselContent className="-ml-4">
                  {stats.map((stat, index) => (
                    <CarouselItem key={index} className="pl-4 basis-4/5 sm:basis-1/2">
                        <StatCard stat={stat} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="hidden md:grid md:grid-cols-3 gap-6">
               {stats.map((stat, index) => (
                  <StatCard key={index} stat={stat} />
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
