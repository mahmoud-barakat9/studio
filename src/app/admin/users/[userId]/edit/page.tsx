import { getUserById, getAllUsers } from "@/lib/firebase-actions";
import { EditUserForm } from "@/components/users/edit-user-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


export default async function EditAdminUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await getUserById(params.userId);

  if (!user) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">لم يتم العثور على المستخدم</h1>
                <p className="text-muted-foreground">المستخدم الذي تحاول تعديله غير موجود.</p>
                <Link href="/admin/users">
                    <Button variant="link" className="p-0 mt-4">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة إلى كل المستخدمين
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
                <h1 className="text-2xl font-bold">تعديل المستخدم: {user.name}</h1>
                <p className="text-muted-foreground">قم بتحديث تفاصيل المستخدم أدناه.</p>
            </div>
            <Link href="/admin/users">
                <Button variant="outline">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل المستخدمين
                </Button>
            </Link>
        </div>
        <EditUserForm user={user} />
    </main>
  );
}
