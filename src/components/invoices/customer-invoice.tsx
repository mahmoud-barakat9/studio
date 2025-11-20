'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CustomerInvoice({ order, customer }: { order: Order, customer?: User }) {
    const customerName = customer?.name || order.customerName;
    const finalTotalCost = order.totalCost + (order.deliveryCost || 0);

    return (
        <div id="customer-invoice" className="bg-card p-6 sm:p-10 rounded-lg shadow-sm border border-border/50 text-foreground">
            <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-muted pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-3xl font-bold text-primary">فاتورة طلب أباجور</h1>
                        <p className="text-sm text-muted-foreground">نظام إدارة طلبات الأباجور</p>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0">
                    <h2 className="text-xl font-bold">ملخص الطلب</h2>
                    <p className="text-sm text-muted-foreground">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main>
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">تفاصيل الطلب والعميل</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-base p-4 border rounded-lg bg-muted/30">
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">اسم الطلب</span> <span className="font-semibold">{order.orderName}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">رقم الطلب</span> <span className="font-mono">{order.id}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">تاريخ الطلب</span> <span>{order.date}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">العميل</span> <span className="font-semibold">{customerName}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">نوع الأباجور</span> <span>{order.mainAbjourType} ({order.mainColor})</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">عرض الشفرة</span> <span>{order.bladeWidth} سم</span></div>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">تفاصيل القطع</h3>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table className="w-full text-sm text-center">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="p-3">#</TableHead>
                                    <TableHead className="p-3 text-right">نوع التركيب</TableHead>
                                    <TableHead className="p-3">طول الشفرة (سم)</TableHead>
                                    <TableHead className="p-3">عدد الشفرات</TableHead>
                                    <TableHead className="p-3">المساحة (م²)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                    return (
                                        <TableRow key={opening.serial} className="even:bg-card">
                                            <TableCell className="p-3 font-mono">{index + 1}</TableCell>
                                            <TableCell className="p-3 text-right font-medium">{opening.abjourType}</TableCell>
                                            <TableCell className="p-3 font-mono">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="p-3 font-mono">{opening.numberOfCodes}</TableCell>
                                            <TableCell className="p-3 font-mono">{area}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-4 bg-muted/60 rounded-lg font-bold flex justify-between items-center text-lg">
                        <span>إجمالي المساحة</span>
                        <span className="font-mono">{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>

                {order.hasDelivery && (
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">معلومات التوصيل</h3>
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                            <div><span className="font-bold">عنوان التوصيل:</span> {order.deliveryAddress}</div>
                            <div><span className="font-bold">تكلفة التوصيل:</span> <span className="font-mono">${(order.deliveryCost || 0).toFixed(2)}</span></div>
                        </div>
                    </section>
                )}

                <section>
                    <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">ملخص مالي</h3>
                    <div className="p-6 border rounded-lg bg-muted/30 space-y-3 max-w-sm mx-auto">
                        <div className="flex justify-between items-center"><span>تكلفة المنتجات:</span> <span className="font-mono font-semibold">${order.totalCost.toFixed(2)}</span></div>
                        {order.hasDelivery && <div className="flex justify-between items-center"><span>تكلفة التوصيل:</span> <span className="font-mono font-semibold">${(order.deliveryCost || 0).toFixed(2)}</span></div>}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-xl text-primary"><span>الإجمالي المطلوب:</span> <span className="font-mono">${finalTotalCost.toFixed(2)}</span></div>
                    </div>
                </section>
            </main>

            <footer className="mt-16 text-center text-xs text-gray-500 border-t pt-6">
                <p>هذا المستند تم إنشاؤه بواسطة نظام طلب أباجور.</p>
                <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}
