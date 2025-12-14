
'use client';
import { getMaterials } from "@/lib/firebase-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PlusCircle, Package } from "lucide-react";
import Link from "next/link";
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
import { deleteMaterial } from "@/lib/actions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";
import type { AbjourTypeData } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";


function DeleteMaterialAlert({ materialName, asChild, children }: { materialName: string; asChild?: boolean; children?: React.ReactNode; }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild={asChild === undefined ? !children : asChild} onClick={(e) => e.stopPropagation()}>
            {children || (
                 <Button size="icon" variant="outline" className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">حذف المادة</span>
                </Button>
            )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف هذه المادة نهائيًا. قد يؤثر هذا على الطلبات القديمة التي تستخدم هذه المادة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <form action={deleteMaterial.bind(null, materialName)}>
              <AlertDialogAction type="submit">متابعة</AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

function MaterialsClientPage({materials}: {materials: AbjourTypeData[]}) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    
    return (
        <Card>
            <CardHeader>
            <CardTitle>قائمة المواد</CardTitle>
            <CardDescription>عرض وتعديل أنواع الأباجور المستخدمة في النظام والمخزون المتاح.</CardDescription>
            </CardHeader>
            <CardContent>
                {isDesktop ? (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead>عرض الشفرة (سم)</TableHead>
                                <TableHead>سعر المتر ($)</TableHead>
                                <TableHead>المخزون (م²)</TableHead>
                                <TableHead>الألوان</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {materials.map((material) => (
                                <TableRow key={material.name} className="even:bg-muted/40">
                                <TableCell className="font-medium">{material.name}</TableCell>
                                <TableCell>{material.bladeWidth}</TableCell>
                                <TableCell>${material.pricePerSquareMeter.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono">{material.stock.toFixed(2)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-sm">
                                        {material.colors.map(color => (
                                            <Badge key={color} variant="secondary">{color}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/materials/${encodeURIComponent(material.name)}/edit`}>
                                            <Button size="icon" variant="outline" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">تعديل المادة</span>
                                            </Button>
                                        </Link>
                                        <DeleteMaterialAlert materialName={material.name} />
                                    </div>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {materials.map((material) => (
                            <Card key={material.name}>
                                <CardHeader>
                                    <CardTitle>{material.name}</CardTitle>
                                    <div className="flex flex-wrap gap-1 pt-2">
                                        {material.colors.map(color => (
                                            <Badge key={color} variant="secondary">{color}</Badge>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">عرض الشفرة</p>
                                        <p className="font-medium">{material.bladeWidth} سم</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">سعر المتر</p>
                                        <p className="font-medium font-mono">${material.pricePerSquareMeter.toFixed(2)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground flex items-center gap-2"><Package/>المخزون المتاح</p>
                                        <p className="font-medium font-mono">{material.stock.toFixed(2)} م²</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Link href={`/admin/materials/${encodeURIComponent(material.name)}/edit`}>
                                        <Button size="sm" variant="outline">
                                            <Pencil className="h-4 w-4 ml-2" />
                                            تعديل
                                        </Button>
                                    </Link>
                                    <DeleteMaterialAlert materialName={material.name} asChild>
                                        <Button size="sm" variant="destructive">
                                            <Trash2 className="h-4 w-4 ml-2" />
                                            حذف
                                        </Button>
                                    </DeleteMaterialAlert>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function AdminMaterialsPage() {
    const [materials, setMaterials] = useState<AbjourTypeData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMaterials() {
            setLoading(true);
            const data = await getMaterials();
            setMaterials(data);
            setLoading(false);
        }
        loadMaterials();
    }, []);

    if (loading) {
        return (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                 <div className="flex items-center">
                    <Skeleton className="h-8 w-48" />
                    <div className="mr-auto"><Skeleton className="h-10 w-36" /></div>
                </div>
                <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-3xl">إدارة المواد</h1>
        <div className="mr-auto flex items-center gap-2">
            <Link href="/admin/materials/new">
                <Button>
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة مادة جديدة
                </Button>
            </Link>
        </div>
      </div>
      <MaterialsClientPage materials={materials} />
    </main>
  );
}
