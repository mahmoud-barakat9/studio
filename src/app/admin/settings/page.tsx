
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  export default function AdminSettingsPage() {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-3xl">الإعدادات</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>إعدادات التطبيق</CardTitle>
            <CardDescription>
              قم بإدارة الإعدادات العامة والتفضيلات لتطبيقك من هنا.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">سيتم إضافة المزيد من الإعدادات هنا قريبًا.</p>
          </CardContent>
        </Card>
      </main>
    );
  }
  