import { getMaterials } from "@/lib/firebase-actions";
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

function DeleteMaterialAlert({ materialName }: { materialName: string }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="outline" className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">حذف المادة</span>
          </Button>
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

export default async function AdminMaterialsPage() {
    const materials = await getMaterials();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">إدارة المواد</h1>
        <div className="mr-auto flex items-center gap-2">
            <Link href="/admin/materials/new">
                <Button size="sm">
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة مادة جديدة
                </Button>
            </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة المواد</CardTitle>
          <CardDescription>عرض وتعديل أنواع الأباجور المستخدمة في النظام والمخزون المتاح.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableRow key={material.name}>
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
                        <div className="flex flex-wrap gap-1 max-w-xs">
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
        </CardContent>
      </Card>
    </main>
  );
}
