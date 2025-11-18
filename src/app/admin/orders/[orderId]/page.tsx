
import { getOrderById, getUsers } from "@/lib/firebase-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderTracker } from "@/components/orders/order-tracker";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrderById(params.orderId);
  const users = await getUsers();

  if (!order) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم نتمكن من العثور على الطلب الذي تبحث عنه.</p>
             <Link href="/admin/orders">
                <Button variant="link" className="p-0 mt-4">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل الطلبات
                </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const customer = users.find((u) => u.id === order.userId);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 grid auto-rows-max gap-4">
           <Card>
            <CardHeader>
                <CardTitle>تتبع حالة الطلب</CardTitle>
            </CardHeader>
            <CardContent>
                <OrderTracker currentStatus={order.status} />
            </CardContent>
           </Card>
           <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفتحات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرقم التسلسلي</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>اللون</TableHead>
                    <TableHead>طول الكود</TableHead>
                    <TableHead>عدد الأكواد</TableHead>
                    <TableHead>إضافات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.openings.map((opening) => (
                    <TableRow key={opening.serial}>
                      <TableCell>{opening.serial}</TableCell>
                      <TableCell>{opening.abjourType}</TableCell>
                      <TableCell>{opening.color}</TableCell>
                      <TableCell>{opening.codeLength}م</TableCell>
                      <TableCell>{opening.numberOfCodes}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {opening.hasEndCap && <Badge variant="secondary">غطاء طرفي</Badge>}
                          {opening.hasAccessories && <Badge variant="secondary">إكسسوارات</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 grid auto-rows-max gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{order.orderName}</CardTitle>
                    <CardDescription>رقم الطلب: {order.id}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الحالة</span>
                        <span>
                            <Badge variant={
                                order.status === 'Completed' ? 'default' :
                                order.status === 'Rejected' ? 'destructive' :
                                'secondary'
                            }>{order.status}</Badge>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">التاريخ</span>
                        <span>{order.date}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">التكلفة الإجمالية</span>
                        <span className="font-semibold">${order.totalCost.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الاسم</span>
                        <span>{customer?.name ?? order.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني</span>
                        <span>{customer?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">رقم الهاتف</span>
                        <span>{order.customerPhone}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
