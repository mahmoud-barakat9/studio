
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PurchaseForm } from "@/components/inventory/purchase-form";
import { getMaterials } from "@/lib/firebase-actions";

export default async function NewPurchasePage() {
    const materials = await getMaterials();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold">إضافة فاتورة شراء جديدة</h1>
                <p className="text-muted-foreground">املأ التفاصيل أدناه لتسجيل بضاعة جديدة في المخزون.</p>
            </div>
             <Link href="/admin/inventory">
                <Button variant="outline">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى المخزون
                </Button>
            </Link>
        </div>
        <PurchaseForm materials={materials} />
    </main>
  );
}
