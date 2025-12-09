
import { getMaterialByName } from "@/lib/firebase-actions";
import { MaterialForm } from "@/components/materials/material-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


export default async function EditMaterialPage({
  params,
}: {
  params: { materialName: string };
}) {
  const material = await getMaterialByName(decodeURIComponent(params.materialName));

  if (!material) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">لم يتم العثور على المادة</h1>
                <p className="text-muted-foreground">المادة التي تحاول تعديلها غير موجودة.</p>
                <Link href="/admin/materials">
                    <Button variant="link" className="p-0 mt-4">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى كل المواد
                    </Button>
                </Link>
            </div>
        </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold">تعديل المادة: {material.name}</h1>
                <p className="text-muted-foreground">قم بتحديث تفاصيل المادة أدناه.</p>
            </div>
            <Link href="/admin/materials">
                <Button variant="outline">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل المواد
                </Button>
            </Link>
        </div>
        <MaterialForm material={material} />
    </main>
  );
}

    