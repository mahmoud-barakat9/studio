
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
import { Eye, Check, X, Pencil, Trash2, Archive, ArchiveRestore, MoreHorizontal, FileText, MessageSquareQuote, AlertTriangle, BadgeDollarSign, BellRing } from "lucide-react";
import type { Order, User } from "@/lib/definitions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { approveOrder, rejectOrder, deleteOrder, archiveOrder, restoreOrder, requestOrderEdit, sendToFactory } from "@/lib/actions";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrderDetailsDialog } from "./order-details-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import React from "react";
import { useToast } from "@/hooks/use-toast";


type StatusVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<string, { variant: StatusVariant; text: string }> = {
  "Pending": { variant: "outline", text: "بانتظار الموافقة" },
  "Approved": { variant: "secondary", text: "جاهزة للإرسال للمعمل" },
  "FactoryOrdered": { variant: "secondary", text: "تم الطلب من المعمل" },
  "Processing": { variant: "default", text: "قيد التجهيز" },
  "FactoryShipped": { variant: "outline", text: "تم الشحن من المعمل" },
  "ReadyForDelivery": { variant: "default", text: "جاهز للتسليم" },
  "Delivered": { variant: "default", text: "تم التوصيل" },
  "Rejected": { variant: "destructive", text: "مرفوض" },
};

// Define delay thresholds in days for each active status
const delayThresholds: Partial<Record<Order['status'], number>> = {
    Pending: 2,
    Approved: 1,
    FactoryOrdered: 2,
    Processing: 7,
    FactoryShipped: 3,
    ReadyForDelivery: 2,
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

function UserOrderActions({ order }: { order: Order }) {
  const { toast } = useToast();

  const handleRequestEdit = async () => {
    const result = await requestOrderEdit(order.id);
    if (result.success) {
      toast({
        title: "تم إرسال طلب التعديل",
        description: "لقد أرسلنا طلبك إلى الإدارة وسيتواصلون معك قريبًا.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "فشل إرسال الطلب",
        description: result.error,
      });
    }
  };
  
  if (order.isArchived) return null;

  return (
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
        ) : (
          <DropdownMenuItem
            onClick={handleRequestEdit}
            disabled={order.isEditRequested}
          >
            <MessageSquareQuote className="ml-2 h-4 w-4" />
            {order.isEditRequested ? "تم طلب التعديل" : "طلب تعديل من الإدارة"}
          </DropdownMenuItem>
        )}
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "غير معروف";
  };

  const handleRowClick = (orderId: string) => {
    const path = isAdmin ? `/admin/orders/${orderId}` : `/orders/${orderId}`;
    router.push(path);
  };

  const isOrderDelayed = (order: Order): boolean => {
    const threshold = delayThresholds[order.status];
    if (threshold === undefined || order.isArchived || order.status === 'Delivered' || order.status === 'Rejected') {
        return false;
    }
    const orderDate = new Date(order.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > threshold;
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

  if (!isDesktop) {
    return (
      <div className="grid gap-4">
        {orders.map((order) => {
          const statusStyle = statusStyles[order.status] || statusStyles["Pending"];
          const finalTotalCost = order.totalCost + (order.deliveryCost || 0);

          return (
            <Card key={order.id} onClick={() => handleRowClick(order.id)} className="cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {order.isEditRequested && <BellRing className="h-4 w-4 text-primary" />}
                        {order.orderName}
                    </CardTitle>
                    <Badge variant={order.isArchived ? 'secondary' : statusStyle.variant}>
                        {order.isArchived ? "مؤرشف" : statusStyle.text}
                    </Badge>
                </div>
                <div className="text-sm text-muted-foreground">رقم الطلب: <span className="font-mono">{order.id}</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {isAdmin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">العميل:</span>
                    <span className="font-medium">{getUserName(order.userId)}</span>
                  </div>
                )}
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">التاريخ:</span>
                    <span className="font-medium">{order.date}</span>
                  </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">التكلفة:</span>
                    <div className="flex items-center gap-2">
                      {order.overriddenPricePerSquareMeter != null && (
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                  <BadgeDollarSign className="h-4 w-4 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>تم تعديل سعر المتر</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="font-bold font-mono">${finalTotalCost.toFixed(2)}</span>
                    </div>
                  </div>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-2" onClick={(e) => e.stopPropagation()}>
                    {isAdmin ? (
                        <div className="flex justify-end w-full">
                            <AdminOrderActions order={order} />
                        </div>
                    ) : (
                        <>
                         <div className="flex justify-between items-center w-full">
                            <div className="flex items-center">
                                <OrderDetailsDialog order={order} />
                                <UserOrderActions order={order} />
                             </div>
                             <Button asChild variant="outline" size="sm" className="w-full">
                                 <Link href={`/orders/${order.id}`}>
                                    عرض التفاصيل الكاملة
                                 </Link>
                             </Button>
                         </div>
                        </>
                    )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">رقم الطلب</TableHead>
                    <TableHead>اسم الطلب</TableHead>
                    {isAdmin && <TableHead className="hidden lg:table-cell">العميل</TableHead>}
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
                    const delayed = isOrderDelayed(order);

                    return (
                      <TableRow 
                        key={order.id}
                        onClick={() => handleRowClick(order.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="hidden sm:table-cell font-mono">{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                             {order.isEditRequested && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <BellRing className="h-4 w-4 text-primary" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>تم طلب تعديل لهذا الطلب</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                             )}
                             {order.orderName}
                          </div>
                        </TableCell>
                        {isAdmin && <TableCell className="hidden lg:table-cell">{getUserName(order.userId)}</TableCell>}
                        <TableCell className="hidden lg:table-cell">{order.date}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Badge variant={order.isArchived ? 'secondary' : statusStyle.variant}>
                                    {order.isArchived ? "مؤرشف" : statusStyle.text}
                                </Badge>
                                {isAdmin && delayed && (
                                    <Badge variant="destructive" className="hidden sm:inline-flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        متأخر
                                    </Badge>
                                )}
                           </div>
                        </TableCell>
                        <TableCell className="text-left font-mono">
                          <div className="flex items-center gap-2 justify-end">
                            {order.overriddenPricePerSquareMeter != null && (
                               <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger>
                                        <BadgeDollarSign className="h-4 w-4 text-primary" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <div className="flex flex-col gap-1 p-1">
                                            <p>تم تعديل سعر المتر</p>
                                            <p><span className="text-muted-foreground">الأصلي:</span> ${order.pricePerSquareMeter.toFixed(2)}</p>
                                            <p><span className="text-muted-foreground">الجديد:</span> ${order.overriddenPricePerSquareMeter.toFixed(2)}</p>
                                          </div>
                                      </TooltipContent>
                                  </Tooltip>
                              </TooltipProvider>
                            )}
                            <span>${finalTotalCost.toFixed(2)}</span>
                          </div>
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
                                  <UserOrderActions order={order} />
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
