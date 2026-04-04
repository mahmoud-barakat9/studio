'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function FactoryInvoice({ order, customer }: { order: Order, customer?: User }) {
    // --- Logic for conditional columns ---
    const showAbjourTypeColumn = order.openings.some(o => o.abjourType !== 'قياسي');
    const showEndCapColumn = order.openings.some(o => o.hasEndCap);
    const showAccessoriesColumn = order.openings.some(o => o.hasAccessories);
    
    const customerName = customer?.name || order.customerName;

    return (
        <div id="factory-invoice" className="bg-white p-10 rounded-lg border border-border shadow-sm text-slate-950 w-full max-w-[850px] mx-auto">
            <header className="flex flex-row justify-between items-start border-b-2 border-slate-100 pb-8 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-3xl font-bold text-red-600 uppercase tracking-tight">طلب تصنيع - معمل</h1>
                        <p className="text-sm text-slate-500 font-bold">TECHNICAL PRODUCTION ORDER</p>
                    </div>
                </div>
                <div className="text-left w-auto">
                    <h2 className="text-xl font-bold text-slate-900">{order.orderName}</h2>
                    <p className="text-sm text-slate-500 font-bold">العميل: {customerName}</p>
                    <p className="text-xs font-mono text-slate-400 mt-1">ID: #{order.id}</p>
                </div>
            </header>

            <main>
                <section className="mb-10">
                    <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        المواصفات الفنية للإنتاج
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
                        <div className="p-4 bg-slate-50 border rounded-2xl text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">نوع الأباجور</p>
                            <p className="font-black text-xl text-slate-900">{order.mainAbjourType}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-2xl text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">اللون المطلوب</p>
                            <p className="font-black text-xl text-slate-900">{order.mainColor}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-2xl text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">عرض الشفرة</p>
                            <p className="font-black text-xl text-slate-900">{order.bladeWidth} سم</p>
                        </div>
                         <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                            <p className="text-red-500 text-[10px] font-bold uppercase mb-1">إجمالي الفتحات</p>
                            <p className="font-black text-2xl text-red-600">{order.openings.length}</p>
                        </div>
                    </div>
                    {order.scheduledDeliveryDate && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
                            <p className="text-yellow-700 text-xs font-bold mb-1">تاريخ الجاهزية المطلوب للتسليم</p>
                            <p className="font-black text-2xl text-yellow-800">{order.scheduledDeliveryDate}</p>
                        </div>
                    )}
                </section>

                <section className="mb-10">
                    <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-900 rounded-full"></span>
                        قياسات القص والتجميع
                    </h3>
                    <div className="rounded-2xl border overflow-hidden">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-slate-900 text-white">
                                <TableRow>
                                    <TableHead className="p-4 text-center font-bold text-white">#</TableHead>
                                    {showAbjourTypeColumn && <TableHead className="p-4 text-center font-bold text-white">نوع التركيب</TableHead>}
                                    <TableHead className="p-4 text-center font-bold text-white">طول الشفرة (سم)</TableHead>
                                    <TableHead className="p-4 text-center font-bold text-white">عدد الشفرات</TableHead>
                                    {showEndCapColumn && <TableHead className="p-4 text-center font-bold text-white">نهاية</TableHead>}
                                    {showAccessoriesColumn && <TableHead className="p-4 text-center font-bold text-white">مجاري</TableHead>}
                                    <TableHead className="p-4 text-center font-bold text-white">المساحة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                    return (
                                        <TableRow key={opening.serial} className="hover:bg-transparent border-b last:border-0 odd:bg-slate-50/50">
                                            <TableCell className="p-4 text-center font-black text-slate-400">{index + 1}</TableCell>
                                            {showAbjourTypeColumn && <TableCell className="p-4 text-center font-black text-base">{opening.abjourType}</TableCell>}
                                            <TableCell className="p-4 text-center font-mono font-black text-2xl text-red-600 bg-red-50/30">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-black text-2xl text-slate-900">{opening.numberOfCodes}</TableCell>
                                            {showEndCapColumn && <TableCell className="p-4 text-center font-bold">{opening.hasEndCap ? '✓ نعم' : '-'}</TableCell>}
                                            {showAccessoriesColumn && <TableCell className="p-4 text-center font-bold">{opening.hasAccessories ? '✓ نعم' : '-'}</TableCell>}
                                            <TableCell className="p-4 text-center font-mono text-slate-500">{area} م²</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-6 bg-slate-100 rounded-2xl font-black flex justify-between items-center text-xl text-slate-900">
                        <span>إجمالي مساحة القص المطلوبة:</span>
                        <span className="font-mono text-3xl">{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>
                
                {order.accessories && order.accessories.length > 0 && (
                     <section>
                        <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 bg-slate-900 rounded-full"></span>
                            قائمة الملحقات الفنية
                        </h3>
                        <div className="rounded-2xl border overflow-hidden">
                            <Table className="w-full text-sm">
                                <TableHeader className="bg-slate-200">
                                    <TableRow>
                                        <TableHead className="p-4 text-center font-bold text-slate-700">اسم الملحق</TableHead>
                                        <TableHead className="p-4 text-center font-bold text-slate-700">الكمية</TableHead>
                                        <TableHead className="p-4 text-center font-bold text-slate-700">الوحدة</TableHead>
                                        <TableHead className="p-4 text-center font-bold text-slate-700">الأهمية</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.accessories.map((acc, index) => (
                                        <TableRow key={index} className="hover:bg-transparent border-b last:border-0">
                                            <TableCell className="p-4 text-center font-bold text-base">{acc.name}</TableCell>
                                            <TableCell className="p-4 text-center font-mono font-black text-xl text-slate-900">{acc.quantity}</TableCell>
                                            <TableCell className="p-4 text-center font-bold">{acc.unit}</TableCell>
                                            <TableCell className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${acc.type === 'required' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {acc.type === 'required' ? 'إلزامي' : 'اختياري'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                )}
            </main>

            <footer className="mt-16 text-center text-[10px] text-slate-400 border-t pt-8">
                <p className="font-bold tracking-widest uppercase">صادر عن نظام إدارة الإنتاج - طلب أباجور</p>
            </footer>
        </div>
    );
}
