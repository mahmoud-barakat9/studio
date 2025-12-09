
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { PurchaseForm } from "@/components/inventory/purchase-form";
import { getMaterials, getSuppliers, getPurchaseById } from "@/lib/firebase-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditPurchasePage({ params }: { params: { purchaseId: string } }) {
    const purchase = await getPurchaseById(params.purchaseId);
    
    if (!purchase) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>لم يتم العثور على الفاتورة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>الفاتورة التي تحاول تعديلها غير موجودة.</p>
                        <Link href="/admin/inventory">
                            <Button variant="link" className="p-0 mt-4">
                                <ArrowRight className="ml-2 h-4 w-4" />
                                العودة إلى المخزون
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        );
    }
    
    const materials = await getMaterials();
    const suppliers = await getSuppliers();

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">تعديل فاتورة الشراء</h1>
                    <p className="text-muted-foreground">قم بتحديث تفاصيل الفاتورة أدناه.</p>
                </div>
                <Link href="/admin/inventory">
                    <Button variant="outline">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى المخزون
                    </Button>
                </Link>
            </div>
            <PurchaseForm materials={materials} suppliers={suppliers} purchase={purchase} />
        </main>
    );
}
