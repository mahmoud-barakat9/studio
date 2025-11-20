
import { getOrderById, getUsers } from "@/lib/firebase-actions";
import { BrandLogo } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order, Opening } from "@/lib/definitions";

export default async function OrderViewPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrderById(params.orderId);
  const users = await getUsers();

  if (!order) {
    return (
      <main className="flex h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم نتمكن من العثور على الطلب الذي تبحث عنه.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const customer = users.find((u) => u.id === order.userId);
  const customerName = customer?.name || order.customerName;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow-sm border">
            <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-200 pb-4 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-2xl font-bold">طلب أباجور</h1>
                        <p className="text-sm text-gray-500">نظام إدارة طلبات الأباجور</p>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    <h2 className="text-xl font-bold">ملخص الطلب</h2>
                    <p className="text-sm">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
                </div>
            </header>
            
            <main>
                <section className="mb-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base p-4 border rounded-lg bg-muted/50">
                        <div><span className="font-bold">اسم الطلب:</span> {order.orderName}</div>
                        <div><span className="font-bold">رقم الطلب:</span> {order.id}</div>
                        <div><span className="font-bold">العميل:</span> {customerName}</div>
                        <div><span className="font-bold">تاريخ الطلب:</span> {order.date}</div>
                        <div><span className="font-bold">نوع الأباجور:</span> {order.mainAbjourType} ({order.mainColor})</div>
                        <div><span className="font-bold">عرض الشفرة:</span> {order.bladeWidth} سم</div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-center mb-4 border-t pt-4">تفاصيل القطع للمعمل</h3>
                    <div className="overflow-x-auto">
                        <Table className="w-full border-collapse text-sm text-center">
                            <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="border p-2">#</TableHead>
                                <TableHead className="border p-2">نوع التركيب</TableHead>
                                <TableHead className="border p-2">طول الشفرة (سم)</TableHead>
                                <TableHead className="border p-2">عدد الشفرات</TableHead>
                                <TableHead className="border p-2">مع نهاية</TableHead>
                                <TableHead className="border p-2">إكسسوارات</TableHead>
                                <TableHead className="border p-2">المساحة (م²)</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {order.openings.map((opening: Opening, index) => {
                                const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                return (
                                <TableRow key={opening.serial} className="even:bg-card">
                                    <TableCell className="border p-2">{index + 1}</TableCell>
                                    <TableCell className="border p-2">{opening.abjourType}</TableCell>
                                    <TableCell className="border p-2">{opening.codeLength.toFixed(2)}</TableCell>
                                    <TableCell className="border p-2">{opening.numberOfCodes}</TableCell>
                                    <TableCell className="border p-2">{opening.hasEndCap ? 'نعم' : 'لا'}</TableCell>
                                    <TableCell className="border p-2">{opening.hasAccessories ? 'نعم' : 'لا'}</TableCell>
                                    <TableCell className="border p-2">{area}</TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg font-bold flex justify-between items-center">
                        <span>المجموع الإجمالي</span>
                        <span>{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>
            </main>

            <footer className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                <p>هذا المستند تم إنشاؤه بواسطة نظام طلب أباجور.</p>
                <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
      </div>
    </div>
  );
}
