
import { getMaterials, getPurchases, getSuppliers } from "@/lib/firebase-actions";
import { InventoryClientPageContent } from "@/components/inventory/inventory-client-page";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminInventoryPage() {
    const [materials, purchases, suppliers] = await Promise.all([
        getMaterials(),
        getPurchases(),
        getSuppliers(),
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h1 className="font-semibold text-3xl">إدارة المخزون</h1>
            <div className="mr-auto flex items-center gap-2">
                <Link href="/admin/inventory/new">
                    <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة فاتورة شراء
                    </Button>
                </Link>
            </div>
        </div>
        <InventoryClientPageContent materials={materials} purchases={purchases} suppliers={suppliers} />
        </main>
    );
}
