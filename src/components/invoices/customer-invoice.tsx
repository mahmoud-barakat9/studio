'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CustomerInvoice({ order, customer }: { order: Order, customer?: User }) {
    const customerName = customer?.name || order.customerName;
    const finalTotalCost = order.totalCost + (order.deliveryCost || 0);
    const pricePerMeter = order.overriddenPricePerSquareMeter ?? order.pricePerSquareMeter;

    const showAbjourTypeColumn = order.openings.some(o => o.abjourType !== 'قياسي');

    return (
        <div id="customer-invoice" className="bg-white p-12 rounded-none border-none text-slate-950 w-[800px] mx-auto overflow-hidden">
            <header className="flex flex-row justify-between items-center border-b-4 border-slate-100 pb-8 mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-primary">فاتورة العميل</h1>
                        <p className="text-sm text-slate-500 font-semibold italic">نظام إدارة طلبات الأباجور</p>
                    </div>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-900">ملخص مالي</h2>
                    <p className="text-sm text-slate-500 font-bold">تاريخ: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs font-mono text-slate-400 mt-1 uppercase">Ref: #{order.id}</p>
                </div>
            </header>

            <main className="space-y-10">
                <section>
                    <h3 className="text-lg font-bold mb-4 text-primary border-r-4 border-primary pr-3">بيانات الطلب والعميل</h3>
                    <div className="grid grid-cols-3 gap-6 text-sm p-8 border-2 border-slate-50 rounded-2xl bg-slate-50/30">
                        <div className="flex flex-col gap-1"><span className="text-slate-400 text-xs font-bold uppercase">اسم الطلب</span> <span className="font-bold text-base text-slate-800">{order.orderName}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-400 text-xs font-bold uppercase">العميل</span> <span className="font-bold text-base text-slate-800">{customerName}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-400 text-xs font-bold uppercase">تاريخ الطلب</span> <span className="font-bold text-base text-slate-800">{order.date}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-400 text-xs font-bold uppercase">نوع الأباجور</span> <span className="font-bold text-base text-slate-800">{order.mainAbjourType}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-400 text-xs font-bold uppercase">اللون</span> <span className="font-bold text-base text-slate-800">{order.mainColor}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-400 text-xs font-bold uppercase">عرض الشفرة</span> <span className="font-bold text-base text-slate-800">{order.bladeWidth} سم</span></div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold mb-4 text-primary border-r-4 border-primary pr-3">تفاصيل القياسات</h3>
                    <div className="rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                        <Table className="w-full">
                            <TableHeader className="bg-slate-900">
                                <TableRow>
                                    <TableHead className="p-4 text-center font-bold text-white">#</TableHead>
                                    {showAbjourTypeColumn && <TableHead className="p-4 text-center font-bold text-white">نوع التركيب</TableHead>}
                                    <TableHead className="p-4 text-center font-bold text-white">طول الشفرة (سم)</TableHead>
                                    <TableHead className="p-4 text-center font-bold text-white">عدد الشفرات</TableHead>
                                    <TableHead className="p-4 text-center font-bold text-white">المساحة (م²)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                    return (
                                        <TableRow key={opening.serial} className="hover:bg-transparent border-b-2 border-slate-50 last:border-0 odd:bg-slate-50/20">
                                            <TableCell className="p-4 text-center font-black text-slate-400">{index + 1}</TableCell>
                                            {showAbjourTypeColumn && <TableCell className="p-4 text-center font-bold text-slate-700">{opening.abjourType}</TableCell>}
                                            <TableCell className="p-4 text-center font-mono font-black text-lg text-slate-900">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-black text-lg text-slate-900">{opening.numberOfCodes}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-bold text-slate-600">{area}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-6 bg-slate-900 text-white rounded-2xl font-black flex justify-between items-center shadow-lg">
                        <span className="text-lg">إجمالي مساحة الطلب:</span>
                        <span className="font-mono text-3xl">{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-10 items-start">
                    <section>
                        <h3 className="text-lg font-bold mb-4 text-primary border-r-4 border-primary pr-3">ملاحظات وخدمات</h3>
                        <div className="p-6 border-2 border-slate-100 rounded-2xl bg-white space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {order.hasDelivery && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">توصيل مفعل</span>}
                                {order.hasInstallation && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">تركيب مفعل</span>}
                            </div>
                            {order.hasDelivery && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">موقع التسليم:</span>
                                    <p className="font-bold text-sm text-slate-700 leading-relaxed">{order.deliveryAddress}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-4 text-primary border-r-4 border-primary pr-3">التكلفة النهائية</h3>
                        <div className="p-8 border-2 border-primary/20 rounded-3xl bg-white space-y-5 shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-2 h-full bg-primary/10"></div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold">سعر المتر المربع:</span> 
                                <span className="font-mono text-slate-900 font-black text-lg">${pricePerMeter.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold">صافي قيمة المنتجات:</span> 
                                <span className="font-mono text-slate-900 font-bold">${order.totalCost.toFixed(2)}</span>
                            </div>
                            {order.hasDelivery && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">رسوم التوصيل والخدمات:</span> 
                                    <span className="font-mono text-slate-900 font-bold">${(order.deliveryCost || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <Separator className="bg-slate-100" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-black text-xl text-primary uppercase">الإجمالي:</span> 
                                <span className="font-mono font-black text-4xl text-primary leading-none">${finalTotalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="mt-20 text-center border-t-2 border-slate-100 pt-8 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} طلب أباجور</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-black uppercase">صادر عن النظام الذكي</span>
                </div>
            </footer>
        </div>
    );
}