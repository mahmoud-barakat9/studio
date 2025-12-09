
'use client';
import { useState, useMemo } from "react";
import { getMaterials, getPurchases, getSuppliers } from "@/lib/firebase-actions";
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
import { PlusCircle, AlertTriangle, Package, DollarSign, Pencil, Trash2 } from "lucide-react";
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
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/pagination";
import type { Purchase } from "@/lib/definitions";

const LOW_STOCK_THRESHOLD = 50; // in square meters
const ITEMS_PER_PAGE = 10;

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

function PurchasesTable({ purchases }: { purchases: Purchase[] }) {
    if (purchases.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8 border rounded-lg">
                لا توجد فواتير لعرضها في هذا التصنيف.
            </div>
        )
    }
    return (
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
    )
}

export default function AdminInventoryPage() {
    const { materials, purchases, suppliers, loading } = useOrdersAndUsers();
    const [currentTabs, setCurrentTabs] = useState<Record<string, number>>({});
    
    const materialsWithCost = useMemo(() => {
        if (!materials || !purchases) return [];
        return materials.map(material => {
            const materialPurchases = purchases.filter(p => p.materialName === material.name);
            const totalQuantityPurchased = materialPurchases.reduce((sum, p) => sum + p.quantity, 0);
            const totalCostOfPurchases = materialPurchases.reduce((sum, p) => sum + (p.purchasePricePerMeter * p.quantity), 0);
            
            const avgPurchasePrice = totalQuantityPurchased > 0 ? totalCostOfPurchases / totalQuantityPurchased : 0;
            const totalStockValue = material.stock * avgPurchasePrice;
            
            return {
                ...material,
                totalStockValue,
            };
        })
    }, [materials, purchases]);

     const handlePageChange = (tab: string, page: number) => {
        setCurrentTabs(prev => ({ ...prev, [tab]: page }));
    };

    const filterGroups = useMemo(() => {
        if (!materials || !purchases || !suppliers) return { byMaterial: [], bySupplier: [] };
        const byMaterial = materials.map(m => ({
            name: m.name,
            purchases: purchases.filter(p => p.materialName === m.name)
        })).filter(g => g.purchases.length > 0);

        const bySupplier = suppliers.map(s => ({
            name: s.name,
            purchases: purchases.filter(p => p.supplierName === s.name)
        })).filter(g => g.purchases.length > 0);

        return { byMaterial, bySupplier };
    }, [materials, purchases, suppliers]);

    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                 <div className="flex items-center">
                    <h1 className="font-semibold text-lg md:text-2xl">إدارة المخزون</h1>
                    <div className="mr-auto"><Skeleton className="h-10 w-36" /></div>
                </div>
                <Card><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                 <Card><CardContent><Skeleton className="h-96 w-full" /></CardContent></Card>
            </main>
        )
    }

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
                <CardDescription>قائمة بجميع فواتير الشراء التي تم تسجيلها، مع إمكانية الفلترة.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="inline-flex w-max">
                            <TabsTrigger value="all">كل الفواتير ({purchases.length})</TabsTrigger>
                            <TabsTrigger value="by-material">حسب المادة</TabsTrigger>
                            <TabsTrigger value="by-supplier">حسب المورد</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all">
                        <div className="space-y-4">
                            <PurchasesTable purchases={purchases.slice(( (currentTabs['all'] || 1) - 1) * ITEMS_PER_PAGE, (currentTabs['all'] || 1) * ITEMS_PER_PAGE)} />
                            {purchases.length > ITEMS_PER_PAGE && (
                                <Pagination 
                                    currentPage={currentTabs['all'] || 1}
                                    totalPages={Math.ceil(purchases.length / ITEMS_PER_PAGE)}
                                    onPageChange={(page) => handlePageChange('all', page)}
                                />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="by-material">
                         <Tabs defaultValue={filterGroups.byMaterial[0]?.name} className="w-full" key={filterGroups.byMaterial[0]?.name}>
                            {filterGroups.byMaterial.length > 0 && (
                                <div className="overflow-x-auto pb-2">
                                    <TabsList className="inline-flex w-max">
                                        {filterGroups.byMaterial.map(group => (
                                            <TabsTrigger key={group.name} value={group.name}>{group.name} ({group.purchases.length})</TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>
                            )}
                             {filterGroups.byMaterial.map(group => {
                                const tabId = `mat-${group.name}`;
                                const currentPage = currentTabs[tabId] || 1;
                                const totalPages = Math.ceil(group.purchases.length / ITEMS_PER_PAGE);
                                const paginatedPurchases = group.purchases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                                return (
                                <TabsContent key={group.name} value={group.name}>
                                    <div className="space-y-4">
                                        <PurchasesTable purchases={paginatedPurchases} />
                                        {totalPages > 1 && (
                                            <Pagination 
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={(page) => handlePageChange(tabId, page)}
                                            />
                                        )}
                                    </div>
                                </TabsContent>
                             )})}
                         </Tabs>
                    </TabsContent>
                     <TabsContent value="by-supplier">
                         <Tabs defaultValue={filterGroups.bySupplier[0]?.name} className="w-full" key={filterGroups.bySupplier[0]?.name}>
                            {filterGroups.bySupplier.length > 0 && (
                                <div className="overflow-x-auto pb-2">
                                    <TabsList className="inline-flex w-max">
                                        {filterGroups.bySupplier.map(group => (
                                            <TabsTrigger key={group.name} value={group.name}>{group.name} ({group.purchases.length})</TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>
                            )}
                             {filterGroups.bySupplier.map(group => {
                                 const tabId = `sup-${group.name}`;
                                const currentPage = currentTabs[tabId] || 1;
                                const totalPages = Math.ceil(group.purchases.length / ITEMS_PER_PAGE);
                                const paginatedPurchases = group.purchases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                                return (
                                <TabsContent key={group.name} value={group.name}>
                                    <div className="space-y-4">
                                        <PurchasesTable purchases={paginatedPurchases} />
                                        {totalPages > 1 && (
                                            <Pagination 
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={(page) => handlePageChange(tabId, page)}
                                            />
                                        )}
                                    </div>
                                </TabsContent>
                             )})}
                         </Tabs>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </main>
  );
}
