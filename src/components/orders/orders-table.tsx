import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, Pencil, Trash2 } from "lucide-react";
import type { Order, User } from "@/lib/definitions";
import { Card, CardContent } from "../ui/card";
import { approveOrder, rejectOrder, deleteOrder } from "@/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<string, { variant: StatusVariant; text: string }> = {
  "Pending Approval": { variant: "outline", text: "بانتظار الموافقة" },
  "Order Placed": { variant: "secondary", text: "تم تقديم الطلب" },
  "In Production": { variant: "default", text: "قيد الإنتاج" },
  Shipped: { variant: "outline", text: "تم الشحن" },
  Completed: { variant: "default", text: "مكتمل" },
  Rejected: { variant: "destructive", text: "مرفوض" },
};

function DeleteOrderAlert({ orderId }: { orderId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">حذف الطلب</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
          <AlertDialogDescription>
            هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الطلب نهائيًا من خوادمنا.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <form action={() => deleteOrder(orderId)}>
            <AlertDialogAction type="submit">متابعة</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


function AdminOrderActions({ order }: { order: Order }) {
  return (
    <div className="flex gap-2">
      {order.status === "Pending Approval" && (
        <>
           <form action={() => approveOrder(order.id)}>
            <Button size="icon" variant="outline" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600">
              <Check className="h-4 w-4" />
              <span className="sr-only">الموافقة على الطلب</span>
            </Button>
          </form>
          <form action={() => rejectOrder(order.id)}>
            <Button size="icon" variant="outline" className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
              <X className="h-4 w-4" />
              <span className="sr-only">رفض الطلب</span>
            </Button>
          </form>
        </>
      )}
       <Link href={`/admin/orders/${order.id}/edit`}>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">تعديل الطلب</span>
          </Button>
        </Link>
        <DeleteOrderAlert orderId={order.id} />
    </div>
  );
}


export function OrdersTable({
  orders,
  users = [],
  isAdmin = false,
  showViewAction = false,
}: {
  orders: Order[];
  users?: User[];
  isAdmin?: boolean;
  showViewAction?: boolean;
}) {
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "غير معروف";
  };
  
  const getViewLink = (orderId: string) => {
    if (isAdmin) {
      return `/admin/orders/${orderId}`;
    }
    return `/dashboard?view_order=${orderId}`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>اسم الطلب</TableHead>
              {isAdmin && <TableHead>العميل</TableHead>}
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">التكلفة الإجمالية</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const statusStyle =
                statusStyles[order.status] || statusStyles["Order Placed"];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.orderName}</TableCell>
                  {isAdmin && <TableCell>{getUserName(order.userId)}</TableCell>}
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyle.variant}>
                      {statusStyle.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    ${order.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-left">
                     <div className="flex items-center gap-2">
                        {isAdmin && <AdminOrderActions order={order} />}
                        {(isAdmin || showViewAction) && (
                        <Link href={getViewLink(order.id)} scroll={false}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">عرض الطلب</span>
                            </Button>
                        </Link>
                        )}
                      </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
