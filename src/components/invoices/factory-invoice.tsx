'use client';
import type { Order } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function FactoryInvoice({ order }: { order: Order }) {
    return (
        <div id="factory-invoice" className="bg-card p-6 sm:p-10 rounded-lg shadow-sm border border-border/50 text-foreground">
            <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-muted pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-3xl font-bold text-primary">طلب تصنيع للمعمل</h1>
                        <p className="text-sm text-muted-foreground">تفاصيل فنية للإنتاج</p>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0">
                    <h2 className="text-xl font-bold">ملخص الطلب</h2>
                    <p className="text-sm text-muted-foreground">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main>
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">المواصفات الرئيسية</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-base p-4 border rounded-lg bg-muted/30">
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">اسم الطلب</span> <span className="font-semibold">{order.orderName}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">رقم الطلب</span> <span className="font-mono">{order.id}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">تاريخ الطلب</span> <span>{order.date}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">نوع الأباجور</span> <span className="font-semibold">{order.mainAbjourType}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">اللون</span> <span className="font-semibold">{order.mainColor}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">عرض الشفرة</span> <span>{order.bladeWidth} سم</span></div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">تفاصيل القطع المطلوبة</h3>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table className="w-full text-sm text-center">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="p-3">#</TableHead>
                                    <TableHead className="p-3 text-right">نوع التركيب</TableHead>
                                    <TableHead className="p-3">طول الشفرة (سم)</TableHead>
                                    <TableHead className="p-3">عدد الشفرات</TableHead>
                                    <TableHead className="p-3">مع نهاية</TableHead>
                                    <TableHead className="p-3">إكسسوارات</TableHead>
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
                                            <TableCell className="p-3">{opening.hasEndCap ? 'نعم' : 'لا'}</TableCell>
                                            <TableCell className="p-3">{opening.hasAccessories ? 'نعم' : 'لا'}</TableCell>
                                            <TableCell className="p-3 font-mono">{area}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-4 bg-muted/60 rounded-lg font-bold flex justify-between items-center text-lg">
                        <span>إجمالي المساحة المطلوبة للتصنيع</span>
                        <span className="font-mono">{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>
            </main>
             <footer className="mt-16 text-center text-xs text-gray-500 border-t pt-6">
                <p>مستند فني للمعمل فقط. صادر من نظام طلب أباجور.</p>
            </footer>
        </div>
    );
}
