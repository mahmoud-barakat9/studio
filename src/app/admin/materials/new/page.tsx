import { MaterialForm } from "@/components/materials/material-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function NewMaterialPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold">إضافة مادة جديدة</h1>
                <p className="text-muted-foreground">املأ التفاصيل أدناه لإنشاء نوع أباجور جديد.</p>
            </div>
             <Link href="/admin/materials">
                <Button variant="outline">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل المواد
                </Button>
            </Link>
        </div>
        <MaterialForm />
    </main>
  );
}
