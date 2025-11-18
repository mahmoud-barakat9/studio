import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/firebase-actions";

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{order.orderName}</CardTitle>
            <CardDescription>رقم الطلب: {order.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">العميل</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الهاتف</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التاريخ</span>
                <span>{order.date}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Separator />
            <div className="flex justify-between w-full font-semibold">
              <span>المساحة الإجمالية</span>
              <span>{order.totalArea.toFixed(2)} م²</span>
            </div>
            <div className="flex justify-between w-full font-semibold">
              <span>التكلفة الإجمالية</span>
              <span>${order.totalCost.toFixed(2)}</span>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>حالة الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTracker currentStatus={order.status} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فتحات الطلب</CardTitle>
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
              {order.openings.map((opening, index) => (
                <TableRow key={index}>
                  <TableCell>{opening.serial}</TableCell>
                  <TableCell>{opening.abjourType}</TableCell>
                  <TableCell>{opening.color}</TableCell>
                  <TableCell>{opening.codeLength} م</TableCell>
                  <TableCell>{opening.numberOfCodes}</TableCell>
                  <TableCell>
                    {opening.hasEndCap && "غطاء طرفي "}
                    {opening.hasAccessories && "إكسسوارات"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
