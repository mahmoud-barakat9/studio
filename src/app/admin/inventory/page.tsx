
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
import { PlusCircle, AlertTriangle, Package, DollarSign } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 50; // in square meters

export default async function AdminInventoryPage() {
    const materials = await getMaterials();
    const purchases = await getPurchases();

    const materialsWithCost = materials.map(material => {
        const avgPurchasePrice = purchases
            .filter(p => p.materialName === material.name)
            .reduce((acc, p, _, arr) => acc + p.purchasePricePerMeter / arr.length, 0);
        
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
    </main>
  );
}

