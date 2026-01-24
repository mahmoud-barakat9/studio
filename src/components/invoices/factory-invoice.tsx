'use client';
import type { Order } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "../ui/separator";

export function FactoryInvoice({ order }: { order: Order }) {
    // --- Logic for conditional columns ---
    const showAbjourTypeColumn = order.openings.some(o => o.abjourType !== 'قياسي');
    const showEndCapColumn = order.openings.some(o => o.hasEndCap);
    const showAccessoriesColumn = order.openings.some(o => o.hasAccessories);
    
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
                    <h2 className="text-xl font-bold">{order.orderName}</h2>
                    <p className="text-sm text-muted-foreground">رقم الطلب: <span className="font-mono">{order.id}</span></p>
                    <p className="text-sm text-muted-foreground">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main>
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">المواصفات الرئيسية للتصنيع</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center p-4 border rounded-lg bg-muted/30">
                        <div className="p-2 bg-background rounded-md">
                            <p className="font-bold text-muted-foreground text-sm">نوع الأباجور</p>
                            <p className="font-bold text-lg text-primary">{order.mainAbjourType}</p>
                        </div>
                        <div className="p-2 bg-background rounded-md">
                            <p className="font-bold text-muted-foreground text-sm">اللون</p>
                            <p className="font-bold text-lg text-primary">{order.mainColor}</p>
                        </div>
                        <div className="p-2 bg-background rounded-md">
                            <p className="font-bold text-muted-foreground text-sm">عرض الشفرة</p>
                            <p className="font-bold text-lg text-primary">{order.bladeWidth} سم</p>
                        </div>
                         <div className="p-2 bg-background rounded-md">
                            <p className="font-bold text-muted-foreground text-sm">عدد الفتحات</p>
                            <p className="font-bold text-lg text-primary">{order.openings.length}</p>
                        </div>
                        {order.scheduledDeliveryDate && (
                             <div className="col-span-full mt-2 p-2 bg-primary/10 rounded-md">
                                <p className="font-bold text-muted-foreground text-sm">تاريخ الجاهزية المطلوب</p>
                                <p className="font-extrabold text-xl text-primary">{order.scheduledDeliveryDate}</p>
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">تفاصيل القطع المطلوبة</h3>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table className="w-full text-sm text-center">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="p-3 w-[50px]">#</TableHead>
                                    {showAbjourTypeColumn && <TableHead className="p-3 text-right">نوع التركيب</TableHead>}
                                    <TableHead className="p-3">طول الشفرة (سم)</TableHead>
                                    <TableHead className="p-3">عدد الشفرات</TableHead>
                                    {showEndCapColumn && <TableHead className="p-3">مع نهاية</TableHead>}
                                    {showAccessoriesColumn && <TableHead className="p-3">إكسسوارات</TableHead>}
                                    <TableHead className="p-3">المساحة (م²)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                    return (
                                        <TableRow key={opening.serial} className="even:bg-card">
                                            <TableCell className="p-3 font-mono font-bold">{index + 1}</TableCell>
                                            {showAbjourTypeColumn && <TableCell className="p-3 text-right font-medium">{opening.abjourType}</TableCell>}
                                            <TableCell className="p-3 font-mono text-base font-semibold">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="p-3 font-mono text-base font-semibold">{opening.numberOfCodes}</TableCell>
                                            {showEndCapColumn && <TableCell className="p-3">{opening.hasEndCap ? 'نعم' : 'لا'}</TableCell>}
                                            {showAccessoriesColumn && <TableCell className="p-3">{opening.hasAccessories ? 'نعم' : 'لا'}</TableCell>}
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
                
                {order.accessories && order.accessories.length > 0 && (
                     <section className="mt-8">
                        <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">الإكسسوارات المطلوبة</h3>
                        <div className="overflow-x-auto rounded-lg border">
                            <Table className="w-full text-sm text-center">
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="p-3 text-right">اسم الإكسسوار</TableHead>
                                        <TableHead className="p-3">الكمية</TableHead>
                                        <TableHead className="p-3">الوحدة</TableHead>
                                        <TableHead className="p-3">النوع</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.accessories.map((acc, index) => (
                                        <TableRow key={index} className="even:bg-card">
                                            <TableCell className="p-3 text-right font-medium">{acc.name}</TableCell>
                                            <TableCell className="p-3 font-mono">{acc.quantity}</TableCell>
                                            <TableCell className="p-3">{acc.unit}</TableCell>
                                            <TableCell className="p-3">{acc.type === 'required' ? 'مطلوب' : 'اختياري'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                )}

            </main>
             <footer className="mt-16 text-center text-xs text-gray-500 border-t pt-6">
                <p>مستند فني للمعمل فقط. صادر من نظام طلب أباجور.</p>
            </footer>
        </div>
    );
}
