'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CustomerInvoice({ order, customer }: { order: Order, customer?: User }) {
    const customerName = customer?.name || order.customerName;
    const finalTotalCost = order.totalCost + (order.deliveryCost || 0);
    const pricePerMeter = order.overriddenPricePerSquareMeter ?? order.pricePerSquareMeter;

    // Check if we should show the abjour type column
    const showAbjourTypeColumn = order.openings.some(o => o.abjourType !== 'قياسي');

    return (
        <div id="customer-invoice" className="bg-white p-10 rounded-lg border border-border shadow-sm text-slate-950 w-full max-w-[850px] mx-auto">
            <header className="flex flex-row justify-between items-start border-b-2 border-slate-100 pb-8 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-3xl font-bold text-primary">فاتورة طلب أباجور</h1>
                        <p className="text-sm text-slate-500">نظام إدارة طلبات الأباجور</p>
                    </div>
                </div>
                <div className="text-left w-auto">
                    <h2 className="text-xl font-bold">ملخص مالي</h2>
                    <p className="text-sm text-slate-500">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main>
                <section className="mb-10">
                    <h3 className="text-lg font-bold mb-4 text-primary">بيانات الطلب والعميل</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-sm p-6 border rounded-xl bg-slate-50/50">
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">اسم الطلب</span> <span className="font-bold text-base">{order.orderName}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">رقم الطلب</span> <span className="font-mono font-bold text-base">#{order.id}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">تاريخ الطلب</span> <span className="font-bold text-base">{order.date}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">العميل</span> <span className="font-bold text-base">{customerName}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">نوع الأباجور</span> <span className="font-bold text-base">{order.mainAbjourType} ({order.mainColor})</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">عرض الشفرة</span> <span className="font-bold text-base">{order.bladeWidth} سم</span></div>
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className="text-lg font-bold mb-4 text-primary">تفاصيل القطع</h3>
                    <div className="rounded-xl border overflow-hidden">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-slate-100/80">
                                <TableRow>
                                    <TableHead className="p-4 text-center font-bold">#</TableHead>
                                    {showAbjourTypeColumn && <TableHead className="p-4 text-center font-bold">نوع التركيب</TableHead>}
                                    <TableHead className="p-4 text-center font-bold">طول الشفرة (سم)</TableHead>
                                    <TableHead className="p-4 text-center font-bold">عدد الشفرات</TableHead>
                                    <TableHead className="p-4 text-center font-bold">المساحة (م²)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                    return (
                                        <TableRow key={opening.serial} className="hover:bg-transparent border-b last:border-0">
                                            <TableCell className="p-4 text-center font-mono">{index + 1}</TableCell>
                                            {showAbjourTypeColumn && <TableCell className="p-4 text-center font-bold">{opening.abjourType}</TableCell>}
                                            <TableCell className="p-4 text-center font-mono font-bold text-base">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-bold text-base">{opening.numberOfCodes}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-bold text-base">{area}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-5 bg-slate-900 text-white rounded-xl font-bold flex justify-between items-center text-lg">
                        <span>إجمالي المساحة</span>
                        <span className="font-mono text-2xl">{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>

                {order.accessories && order.accessories.length > 0 && (
                    <section className="mb-10">
                        <h3 className="text-lg font-bold mb-4 text-primary">الإكسسوارات المضافة</h3>
                        <div className="rounded-xl border overflow-hidden">
                            <Table className="w-full text-sm">
                                <TableHeader className="bg-slate-100/80">
                                    <TableRow>
                                        <TableHead className="p-4 text-center font-bold">اسم الإكسسوار</TableHead>
                                        <TableHead className="p-4 text-center font-bold">الكمية</TableHead>
                                        <TableHead className="p-4 text-center font-bold">الوحدة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.accessories.map((acc, index) => (
                                        <TableRow key={index} className="hover:bg-transparent border-b last:border-0">
                                            <TableCell className="p-4 text-center font-bold">{acc.name}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-bold text-base">{acc.quantity}</TableCell>
                                            <TableCell className="p-4 text-center">{acc.unit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                )}

                {(order.hasDelivery || order.hasInstallation) && (
                    <section className="mb-10">
                        <h3 className="text-lg font-bold mb-4 text-primary">الخدمات الإضافية</h3>
                        <div className="p-6 border rounded-xl bg-slate-50/50 space-y-4">
                            {order.hasDelivery && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-500 font-bold">عنوان التوصيل</span>
                                    <p className="font-bold text-sm">{order.deliveryAddress}</p>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-4">
                                {order.hasDelivery && <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">خدمة توصيل مفعلة</div>}
                                {order.hasInstallation && <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">خدمة تركيب مفعلة</div>}
                            </div>
                        </div>
                    </section>
                )}

                <section className="max-w-sm mr-auto">
                    <h3 className="text-lg font-bold mb-4 text-primary text-left">التكلفة النهائية</h3>
                    <div className="p-6 border-2 border-primary/20 rounded-2xl bg-white space-y-4 shadow-sm">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-500">سعر المتر المربع:</span> 
                            <span className="font-mono text-primary text-base">${pricePerMeter.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-500">تكلفة المنتجات:</span> 
                            <span className="font-mono text-base">${order.totalCost.toFixed(2)}</span>
                        </div>
                        {order.hasDelivery && (
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-500">تكلفة التوصيل:</span> 
                                <span className="font-mono text-base">${(order.deliveryCost || 0).toFixed(2)}</span>
                            </div>
                        )}
                        <Separator className="my-2 bg-slate-200" />
                        <div className="flex justify-between items-center font-extrabold text-2xl text-primary">
                            <span>الإجمالي:</span> 
                            <span className="font-mono">${finalTotalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-16 text-center text-[10px] text-slate-400 border-t pt-8 flex justify-between items-center">
                <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} طلب أباجور</p>
                <p>تم الإصدار عبر نظام الإدارة الذكي</p>
            </footer>
        </div>
    );
}
