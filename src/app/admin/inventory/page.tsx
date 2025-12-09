
'use client';
import { useState, useMemo } from "react";
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
import { PlusCircle, AlertTriangle, Package, DollarSign, Pencil, Trash2, SlidersHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { deletePurchase } from "@/lib/actions";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/pagination";
import type { Purchase } from "@/lib/definitions";

const LOW_STOCK_THRESHOLD = 50; // in square meters
const ITEMS_PER_PAGE = 10;

type FilterType = 'all' | 'material' | 'supplier';
type FilterValue = string;

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

function PurchasesTable({ purchases, suppliers }: { purchases: Purchase[], suppliers: any[] }) {
    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || id;

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
                        <TableCell className="font-medium">{getSupplierName(purchase.supplierName)}</TableCell>
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
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<{type: FilterType, value: FilterValue}>({ type: 'all', value: 'all' });
    
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
      });
  }, [materials, purchases]);

    const filteredPurchases = useMemo(() => {
        if (filter.type === 'all') return purchases;
        if (filter.type === 'material') return purchases.filter(p => p.materialName === filter.value);
        if (filter.type === 'supplier') return purchases.filter(p => p.supplierName === filter.value);
        return [];
    }, [purchases, filter]);

    const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
    const paginatedPurchases = filteredPurchases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterChange = (type: FilterType, value: FilterValue) => {
        setFilter({ type, value });
        setCurrentPage(1); // Reset to first page on filter change
    };

    const getFilterLabel = () => {
        if (filter.type === 'all') return 'كل الفواتير';
        if (filter.type === 'material') return `المادة: ${filter.value}`;
        if (filter.type === 'supplier') {
            const supplier = suppliers.find(s => s.id === filter.value);
            return `المورد: ${supplier?.name || filter.value}`;
        }
        return 'فلترة';
    }


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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materialsWithCost.map((material) => {
              const isLowStock = material.stock < LOW_STOCK_THRESHOLD;
              return (
                  <Card key={material.name} className={cn("flex flex-col justify-between", isLowStock && "border-destructive")}>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium">{material.name}</CardTitle>
                      {isLowStock ? (
                          <Badge variant="destructive" className="flex items-center gap-1.5 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              مخزون منخفض
                          </Badge>
                      ) : (
                          <Badge variant="secondary">متوفر</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">الكمية المتاحة (م²)</p>
                            <p className="text-xl font-bold font-mono">{material.stock.toFixed(2)}</p>
                          </div>
                      </div>
                       <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                           <div>
                            <p className="text-sm text-muted-foreground">قيمة المخزون الإجمالية</p>
                            <p className="text-xl font-bold font-mono">${material.totalStockValue.toFixed(2)}</p>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
              );
              })}
          </div>
        </CardContent>
      </Card>

        <Card>
            <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>سجل فواتير الشراء</CardTitle>
                    <CardDescription>قائمة بجميع فواتير الشراء التي تم تسجيلها، مع إمكانية الفلترة.</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                            <SlidersHorizontal className="ml-2 h-4 w-4" />
                            {getFilterLabel()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>فلترة حسب</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleFilterChange('all', 'all')}>
                            كل الفواتير
                        </DropdownMenuItem>
                        
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>المادة</DropdownMenuLabel>
                            {materials?.map(m => (
                                <DropdownMenuItem key={m.name} onClick={() => handleFilterChange('material', m.name)}>
                                    {m.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                             <DropdownMenuLabel>المورد</DropdownMenuLabel>
                             {suppliers?.map(s => (
                                <DropdownMenuItem key={s.id} onClick={() => handleFilterChange('supplier', s.id)}>
                                    {s.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>

                    </DropdownMenuContent>
                </DropdownMenu>

            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <PurchasesTable purchases={paginatedPurchases} suppliers={suppliers} />
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    </main>
  );
}
