
import { getUserById, getOrdersByUserId } from "@/lib/firebase-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Mail, Phone, User as UserIcon, Shield, Pencil, AlertTriangle } from "lucide-react";
import { OrdersTable } from "@/components/orders/orders-table";
import { Badge } from "@/components/ui/badge";

export default async function UserDetailsPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await getUserById(params.userId);
  const userOrders = user ? await getOrdersByUserId(user.id) : [];

  if (!user) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                لم يتم العثور على المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>المستخدم الذي تبحث عنه غير موجود.</p>
             <Link href="/admin/users">
                <Button variant="link" className="p-0 mt-4">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل المستخدمين
                </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
            <h1 className="text-2xl font-bold">تفاصيل المستخدم</h1>
            <p className="text-muted-foreground">عرض شامل لمعلومات المستخدم وسجل طلباته.</p>
        </div>
        <div className="flex items-center gap-2">
            <Link href={`/admin/users/${user.id}/edit`}>
              <Button variant="outline">
                <Pencil className="ml-2 h-4 w-4" />
                تعديل المستخدم
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button>
                <ArrowRight className="ml-2 h-4 w-4" />
                كل المستخدمين
              </Button>
            </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
             <UserIcon className="h-6 w-6" />
            {user.name}
          </CardTitle>
          <CardDescription>المعلومات الأساسية للمستخدم.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">البريد الإلكتروني</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-muted-foreground">رقم الهاتف</p>
                        <p className="font-medium">{user.phone || 'غير متوفر'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">الدور</p>
                        <div className="font-medium">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>طلبات المستخدم ({userOrders.length})</CardTitle>
          <CardDescription>قائمة بجميع الطلبات التي قام بها {user.name}.</CardDescription>
        </CardHeader>
        <CardContent>
            <OrdersTable orders={userOrders} users={[user]} isAdmin={true} />
        </CardContent>
      </Card>

    </main>
  );
}
