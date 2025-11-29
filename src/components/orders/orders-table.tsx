

'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Eye, Check, X, Pencil, Trash2, Archive, ArchiveRestore, MoreHorizontal, FileText, MessageSquareQuote } from "lucide-react";
import type { Order, User } from "@/lib/definitions";
import { Card, CardContent } from "../ui/card";
import { approveOrder, rejectOrder, deleteOrder, archiveOrder, restoreOrder, generateWhatsAppEditRequest, sendToFactory } from "@/lib/actions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OrderDetailsDialog } from "./order-details-dialog";


type StatusVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<string, { variant: StatusVariant; text: string }> = {
  Pending: { variant: "outline", text: "بانتظار الموافقة" },
  Approved: { variant: "secondary", text: "جاهزة للإرسال للمعمل" },
  FactoryOrdered: { variant: "secondary", text: "تم الطلب من المعمل" },
  Processing: { variant: "default", text: "قيد التجهيز" },
  FactoryShipped: { variant: "outline", text: "تم الشحن من المعمل" },
  ReadyForDelivery: { variant: "default", text: "جاهز للتسليم" },
  Delivered: { variant: "default", text: "تم التوصيل" },
  Rejected: { variant: "destructive", text: "مرفوض" },
};

function DeleteOrderAlert({ orderId, asChild = false, children }: { orderId: string, asChild?: boolean, children?: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild} onClick={(e) => e.stopPropagation()}>
        {asChild ? children : 
          <Button size="icon" variant="outline" className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">حذف الطلب</span>
          </Button>
        }
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
          <form action={deleteOrder.bind(null, orderId)}>
            <AlertDialogAction type="submit">متابعة</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


function AdminOrderActions({ order }: { order: Order }) {
  
  const handleApprove = async () => {
    const result = await approveOrder(order.id);
    if (result.success && result.whatsappUrl) {
      window.open(result.whatsappUrl, '_blank');
    }
  };

  const handleReject = async () => {
    const result = await rejectOrder(order.id);
    if (result.success && result.whatsappUrl) {
      window.open(result.whatsappUrl, '_blank');
    }
  };

  const handleSendToFactory = async () => {
    const result = await sendToFactory(order.id);
    if (result.success && result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <span className="sr-only">فتح القائمة</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {order.isArchived ? (
          <form action={restoreOrder.bind(null, order.id)} className="w-full">
            <DropdownMenuItem asChild>
               <button type="submit" className="w-full">
                <ArchiveRestore className="ml-2 h-4 w-4" />
                استعادة
              </button>
            </DropdownMenuItem>
          </form>
        ) : (
          <>
            {order.status === "Pending" && (
              <>
                <DropdownMenuItem onClick={handleApprove} className="w-full text-green-600 focus:text-green-700 cursor-pointer">
                  <Check className="ml-2 h-4 w-4" />
                  موافقة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReject} className="w-full text-red-600 focus:text-red-700 cursor-pointer">
                  <X className="ml-2 h-4 w-4" />
                  رفض
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
             {order.status === 'Approved' && (
                <>
                    <DropdownMenuItem onClick={handleSendToFactory} className="w-full cursor-pointer">
                       <MessageSquareQuote className="ml-2 h-4 w-4" />
                        إرسال للمعمل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order.id}/edit`}>
                <Pencil className="ml-2 h-4 w-4" />
                تعديل
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order.id}`}>
                 <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </Link>
            </DropdownMenuItem>
            <form action={archiveOrder.bind(null, order.id)} className="w-full">
               <DropdownMenuItem asChild>
                 <button type="submit" className="w-full">
                    <Archive className="ml-2 h-4 w-4" />
                    أرشفة
                  </button>
              </DropdownMenuItem>
            </form>
          </>
        )}
        <DropdownMenuSeparator />
         <DeleteOrderAlert orderId={order.id} asChild>
            <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive focus:text-destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
            </button>
        </DeleteOrderAlert>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function OrdersTable({
  orders,
  users = [],
  isAdmin = false,
}: {
  orders: Order[];
  users?: User[];
  isAdmin?: boolean;
}) {
  const router = useRouter();

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "غير معروف";
  };

  const handleRowClick = (orderId: string) => {
    const path = isAdmin ? `/admin/orders/${orderId}` : `/orders/${orderId}`;
    router.push(path);
  };
  
  if (orders.length === 0) {
    return (
        <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد طلبات لعرضها في هذا القسم.
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">رقم الطلب</TableHead>
                    <TableHead>اسم الطلب</TableHead>
                    {isAdmin && <TableHead className="hidden lg:table-cell">العميل</TableHead>}
                    <TableHead className="hidden sm:table-cell">النوع واللون</TableHead>
                    <TableHead className="hidden lg:table-cell">التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">التكلفة</TableHead>
                    <TableHead className="text-left w-[50px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const statusStyle =
                      statusStyles[order.status] || statusStyles["Pending"];
                    const finalTotalCost = order.totalCost + (order.deliveryCost || 0);
                    return (
                      <TableRow 
                        key={order.id}
                        onClick={() => handleRowClick(order.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium hidden md:table-cell">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.orderName}</span>
                            {!isAdmin && (
                               <span className="text-xs text-muted-foreground sm:hidden">
                                {order.mainAbjourType} ({order.mainColor})
                              </span>
                            )}
                             {isAdmin && (
                               <span className="text-xs text-muted-foreground lg:hidden">
                                {getUserName(order.userId)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {isAdmin && <TableCell className="hidden lg:table-cell">{getUserName(order.userId)}</TableCell>}
                        <TableCell className="hidden sm:table-cell">
                            <div className="flex flex-col">
                              <span>{order.mainAbjourType}</span>
                              <span className="text-xs text-muted-foreground">{order.mainColor}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{order.date}</TableCell>
                        <TableCell>
                          <Badge variant={order.isArchived ? 'secondary' : statusStyle.variant}>
                            {order.isArchived ? "مؤرشف" : statusStyle.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left font-mono">
                          ${finalTotalCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-left" onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center gap-1 justify-end">
                              {isAdmin ? (
                                 <AdminOrderActions order={order} />
                              ) : (
                                <>
                                  <OrderDetailsDialog order={order} />
                                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                    <Link href={`/orders/${order.id}`}>
                                      <FileText className="h-4 w-4" />
                                      <span className="sr-only">عرض التفاصيل الكاملة</span>
                                    </Link>
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">فتح القائمة</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {order.status === 'Pending' && !order.isArchived ? (
                                        <DropdownMenuItem asChild>
                                          <Link href={`/orders/${order.id}/edit`}>
                                            <Pencil className="ml-2 h-4 w-4" />
                                            تعديل الطلب
                                          </Link>
                                        </DropdownMenuItem>
                                      ) : !order.isArchived ? (
                                         <form action={generateWhatsAppEditRequest.bind(null, order.id, order.orderName)} className="w-full">
                                            <DropdownMenuItem asChild>
                                               <button type="submit" className="w-full">
                                                  <MessageSquareQuote className="ml-2 h-4 w-4" />
                                                  طلب تعديل من الإدارة
                                                </button>
                                            </DropdownMenuItem>
                                          </form>
                                      ) : null}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
            </Table>
          </div>
      </CardContent>
    </Card>
  );
}
