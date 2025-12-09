
import { getMaterials, getPurchases } from "@/lib/firebase-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, Package, DollarSign, FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
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


const LOW_STOCK_THRESHOLD = 50; // in square meters

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

export default async function AdminInventoryPage() {
    const materials = await getMaterials();
    const purchases = await getPurchases();

    const materialsWithCost = materials.map(material => {
        const materialPurchases = purchases.filter(p => p.materialName === material.name);
        const totalQuantityPurchased = materialPurchases.reduce((sum, p) => sum + p.quantity, 0);
        const totalCostOfPurchases = materialPurchases.reduce((sum, p) => sum + (p.purchasePricePerMeter * p.quantity), 0);
        
        const avgPurchasePrice = totalQuantityPurchased > 0 ? totalCostOfPurchases / totalQuantityPurchased : 0;
        const totalStockValue = material.stock * avgPurchasePrice;
        
        return {
            ...material,
            totalStockValue,
        };
    });


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">إدارة المخزون</h1>
        <div className="mr-auto flex items-center gap-2">
            <Link href="/admin/inventory/new">
                <Button size="sm">
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة فاتورة شراء
                </Button>
            </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>المخزون الحالي</CardTitle>
          <CardDescription>عرض الكميات المتاحة من كل مادة في المخزون.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المادة</TableHead>
                    <TableHead>الكمية المتاحة (م²)</TableHead>
                    <TableHead>قيمة المخزون الإجمالية</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialsWithCost.map((material) => {
                    const isLowStock = material.stock < LOW_STOCK_THRESHOLD;
                    return (
                        <TableRow key={material.name} className={cn(isLowStock && "bg-destructive/10 hover:bg-destructive/20")}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{material.stock.toFixed(2)}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">${material.totalStockValue.toFixed(2)}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {isLowStock ? (
                                <Badge variant="destructive" className="flex items-center gap-1.5 w-fit">
                                    <AlertTriangle className="h-3 w-3" />
                                    مخزون منخفض
                                </Badge>
                            ) : (
                                <Badge variant="secondary">متوفر</Badge>
                            )}
                        </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

        <Card>
            <CardHeader>
                <CardTitle>سجل فواتير الشراء</CardTitle>
                <CardDescription>قائمة بجميع فواتير الشراء التي تم تسجيلها.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>تاريخ الفاتورة</TableHead>
                            <TableHead>المورد</TableHead>
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
                             <TableRow key={purchase.id} className="even:bg-muted/40">
                                <TableCell>{format(new Date(purchase.date), 'yyyy-MM-dd')}</TableCell>
                                <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                                <TableCell>{purchase.materialName}</TableCell>
                                <TableCell>{purchase.color}</TableCell>
                                <TableCell className="font-mono">{purchase.quantity.toFixed(2)}</TableCell>
                                <TableCell className="font-mono">${purchase.purchasePricePerMeter.toFixed(2)}</TableCell>
                                <TableCell className="font-mono font-bold bg-primary/5 text-primary">
                                    ${(purchase.quantity * purchase.purchasePricePerMeter).toFixed(2)}
                                </TableCell>
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
