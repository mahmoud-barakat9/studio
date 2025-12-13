

'use client';

import { getSuppliers, getPurchases } from "@/lib/firebase-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddSupplierForm } from "@/components/suppliers/add-supplier-form";
import { Package, DollarSign, ListOrdered, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

export default function AdminSuppliersPage() {
    const { purchases, suppliers, loading } = useOrdersAndUsers();

    const suppliersWithStats = useMemo(() => {
        if (loading) return [];
        return suppliers.map(supplier => {
            const supplierPurchases = purchases.filter(p => p.supplierName === supplier.name);
            const totalPurchasesValue = supplierPurchases.reduce((sum, p) => sum + (p.quantity * p.purchasePricePerMeter), 0);
            const totalQuantity = supplierPurchases.reduce((sum, p) => sum + p.quantity, 0);
            const purchaseCount = supplierPurchases.length;
            return {
                ...supplier,
                totalPurchasesValue,
                totalQuantity,
                purchaseCount
            };
        });
    }, [purchases, suppliers, loading]);

    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                 <div className="flex items-center">
                    <h1 className="font-semibold text-lg md:text-2xl">إدارة الموردين</h1>
                </div>
                <div className="space-y-8">
                    <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                    <Card><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                </div>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">إدارة الموردين</h1>
      </div>
      
      <Card>
          <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>عرض جميع الموردين المسجلين في النظام مع إحصائياتهم.</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="overflow-x-auto">
              <Table className="min-w-full">
                  <TableHeader>
                  <TableRow>
                      <TableHead>اسم المورد</TableHead>
                      <TableHead>إجمالي قيمة المشتريات</TableHead>
                      <TableHead>إجمالي الكمية (م²)</TableHead>
                      <TableHead>عدد الفواتير</TableHead>
                      <TableHead>الإجراءات</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {suppliersWithStats.map((supplier) => (
                      <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>
                               <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono">${supplier.totalPurchasesValue.toFixed(2)}</span>
                              </div>
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono">{supplier.totalQuantity.toFixed(2)}</span>
                              </div>
                          </TableCell>
                           <TableCell>
                               <div className="flex items-center gap-2">
                                  <ListOrdered className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono">{supplier.purchaseCount}</span>
                              </div>
                          </TableCell>
                          <TableCell>
                              <Link href={`/admin/suppliers/${supplier.id}`}>
                                  <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4 ml-2" />
                                      عرض التفاصيل
                                  </Button>
                              </Link>
                          </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
          </div>
          </CardContent>
      </Card>
      
      <div className="max-w-2xl">
        <AddSupplierForm />
      </div>

    </main>
  );
}
