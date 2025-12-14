
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AddSupplierForm } from "@/components/suppliers/add-supplier-form";
import { Package, DollarSign, ListOrdered, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSuppliers, getPurchases } from "@/lib/firebase-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Supplier, Purchase } from "@/lib/definitions";

function SuppliersClientPage({ initialPurchases, initialSuppliers }: { initialPurchases: Purchase[], initialSuppliers: Supplier[] }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const suppliersWithStats = useMemo(() => {
        return initialSuppliers.map(supplier => {
            const supplierPurchases = initialPurchases.filter(p => p.supplierName === supplier.name);
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
    }, [initialPurchases, initialSuppliers]);


    return (
        <>
            <Card>
                <CardHeader>
                <CardTitle>قائمة الموردين</CardTitle>
                <CardDescription>عرض جميع الموردين المسجلين في النظام مع إحصائياتهم.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isDesktop ? (
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
                                    <TableRow key={supplier.id} className="even:bg-muted/40">
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
                    ) : (
                        <div className="grid gap-4">
                            {suppliersWithStats.map((supplier) => (
                                <Card key={supplier.id}>
                                    <CardHeader>
                                        <CardTitle>{supplier.name}</CardTitle>
                                        <CardDescription>عدد الفواتير: {supplier.purchaseCount}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">قيمة المشتريات</p>
                                            <p className="font-medium font-mono">${supplier.totalPurchasesValue.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">الكمية (م²)</p>
                                            <p className="font-medium font-mono">{supplier.totalQuantity.toFixed(2)}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild variant="secondary" className="w-full">
                                            <Link href={`/admin/suppliers/${supplier.id}`}>
                                                <Eye className="h-4 w-4 ml-2" />
                                                عرض التفاصيل
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="max-w-2xl">
                <AddSupplierForm />
            </div>
        </>
    );
}

export default function AdminSuppliersPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [purchasesData, suppliersData] = await Promise.all([
                getPurchases(),
                getSuppliers()
            ]);
            setPurchases(purchasesData);
            setSuppliers(suppliersData);
            setLoading(false);
        }
        loadData();
    }, []);

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
        <h1 className="font-semibold text-3xl">إدارة الموردين</h1>
      </div>
      
      <SuppliersClientPage initialPurchases={purchases} initialSuppliers={suppliers} />

    </main>
  );
}
