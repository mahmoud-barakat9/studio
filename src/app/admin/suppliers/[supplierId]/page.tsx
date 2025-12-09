
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
import { ArrowRight, Package, DollarSign, ListOrdered, AlertTriangle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { format } from "date-fns";


export default async function SupplierDetailsPage({
  params,
}: {
  params: { supplierId: string };
}) {
  const supplier = await getSupplierById(params.supplierId);
  const supplierPurchases = supplier ? await getPurchasesBySupplierId(supplier.name) : [];

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

  const totalPurchasesValue = supplierPurchases.reduce((sum, p) => sum + (p.quantity * p.purchasePricePerMeter), 0);
  const totalQuantity = supplierPurchases.reduce((sum, p) => sum + p.quantity, 0);

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
                        <p className="font-bold text-lg font-mono">{supplierPurchases.length}</p>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>فواتير المورد ({supplierPurchases.length})</CardTitle>
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {supplierPurchases.map(purchase => (
                        <TableRow key={purchase.id}>
                            <TableCell>{format(new Date(purchase.date), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{purchase.materialName}</TableCell>
                            <TableCell>{purchase.color}</TableCell>
                            <TableCell className="font-mono">{purchase.quantity.toFixed(2)}</TableCell>
                            <TableCell className="font-mono">${purchase.purchasePricePerMeter.toFixed(2)}</TableCell>
                            <TableCell className="font-mono font-bold">${(purchase.quantity * purchase.purchasePricePerMeter).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </main>
  );
}

    