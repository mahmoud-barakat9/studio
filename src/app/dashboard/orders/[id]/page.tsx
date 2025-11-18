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
            <CardDescription>Order ID: {order.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{order.date}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Separator />
            <div className="flex justify-between w-full font-semibold">
              <span>Total Area</span>
              <span>{order.totalArea.toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between w-full font-semibold">
              <span>Total Cost</span>
              <span>${order.totalCost.toFixed(2)}</span>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTracker currentStatus={order.status} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Openings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Code Length</TableHead>
                <TableHead>Num. of Codes</TableHead>
                <TableHead>Extras</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.openings.map((opening, index) => (
                <TableRow key={index}>
                  <TableCell>{opening.serial}</TableCell>
                  <TableCell>{opening.abjourType}</TableCell>
                  <TableCell>{opening.color}</TableCell>
                  <TableCell>{opening.codeLength} m</TableCell>
                  <TableCell>{opening.numberOfCodes}</TableCell>
                  <TableCell>
                    {opening.hasEndCap && "End Cap "}
                    {opening.hasAccessories && "Accessories"}
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
