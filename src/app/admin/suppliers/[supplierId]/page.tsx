
'use client';
import { getSupplierById, getPurchasesBySupplierId } from "@/lib/firebase-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Package, DollarSign, ListOrdered, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { deletePurchase } from "@/lib/actions";
import type { Purchase, Supplier } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";


function DeletePurchaseAlert({ purchaseId }: { purchaseId: string }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="outline" className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">حذف الفاتورة</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف هذه الفاتورة نهائيًا وسيقوم بتحديث المخزون بناءً على ذلك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <form action={deletePurchase.bind(null, purchaseId)}>
              <AlertDialogAction type="submit">متابعة الحذف</AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
}

export default function SupplierDetailsPage() {
  const params = useParams();
  const supplierId = params.supplierId as string;

  const [supplier, setSupplier] = useState<Supplier | null | undefined>(undefined);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  useEffect(() => {
    async function fetchData() {
        if (!supplierId) return;
        const supplierData = await getSupplierById(supplierId);
        setSupplier(supplierData);
        if (supplierData) {
            const purchasesData = await getPurchasesBySupplierId(supplierData.name);
            setPurchases(purchasesData);
        }
    }
    fetchData();
  }, [supplierId]);


  if (supplier === undefined) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </main>
    )
  }

  if (!supplier) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                لم يتم العثور على المورد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>المورد الذي تبحث عنه غير موجود.</p>
             <Link href="/admin/suppliers">
                <Button variant="link" className="p-0 mt-4">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل الموردين
                </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const totalPurchasesValue = purchases.reduce((sum, p) => sum + (p.quantity * p.purchasePricePerMeter), 0);
  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
            <h1 className="text-2xl font-bold">تفاصيل المورد</h1>
            <p className="text-muted-foreground">عرض شامل لمعلومات المورد وسجل فواتيره.</p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/admin/suppliers">
              <Button>
                <ArrowRight className="ml-2 h-4 w-4" />
                كل الموردين
              </Button>
            </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {supplier.name}
          </CardTitle>
          <CardDescription>الإحصائيات الرئيسية للمورد.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-muted-foreground">إجمالي قيمة المشتريات</p>
                        <p className="font-bold text-lg font-mono">${totalPurchasesValue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Package className="h-8 w-8 text-primary" />
                     <div>
                        <p className="text-muted-foreground">إجمالي الكمية (م²)</p>
                        <p className="font-bold text-lg font-mono">{totalQuantity.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <ListOrdered className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-muted-foreground">عدد الفواتير</p>
                        <p className="font-bold text-lg font-mono">{purchases.length}</p>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>فواتير المورد ({purchases.length})</CardTitle>
          <CardDescription>قائمة بجميع فواتير الشراء من {supplier.name}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>تاريخ الفاتورة</TableHead>
                        <TableHead>المادة</TableHead>
                        <TableHead>اللون</TableHead>
                        <TableHead>الكمية (م²)</TableHead>
                        <TableHead>سعر المتر ($)</TableHead>
                        <TableHead>الإجمالي ($)</TableHead>
                        <TableHead>الإجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map(purchase => (
                        <TableRow key={purchase.id}>
                            <TableCell>{format(new Date(purchase.date), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{purchase.materialName}</TableCell>
                            <TableCell>{purchase.color}</TableCell>
                            <TableCell className="font-mono">{purchase.quantity.toFixed(2)}</TableCell>
                            <TableCell className="font-mono">${purchase.purchasePricePerMeter.toFixed(2)}</TableCell>
                            <TableCell className="font-mono font-bold">${(purchase.quantity * purchase.purchasePricePerMeter).toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Link href={`/admin/inventory/${purchase.id}/edit`}>
                                        <Button size="icon" variant="outline" className="h-8 w-8">
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">تعديل الفاتورة</span>
                                        </Button>
                                    </Link>
                                    <DeletePurchaseAlert purchaseId={purchase.id} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </main>
  );
}