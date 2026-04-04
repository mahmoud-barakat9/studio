'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function FactoryInvoice({ order, customer }: { order: Order, customer?: User }) {
    const showAbjourTypeColumn = order.openings.some(o => o.abjourType !== 'قياسي');
    const showEndCapColumn = order.openings.some(o => o.hasEndCap);
    const showAccessoriesColumn = order.openings.some(o => o.hasAccessories);
    
    const customerName = customer?.name || order.customerName;

    return (
        <div id="factory-invoice" className="bg-white p-12 rounded-none border-none text-slate-950 w-[800px] min-w-[800px] max-w-[800px] mx-auto overflow-hidden shadow-none">
            <header className="flex flex-row justify-between items-center border-b-4 border-red-100 pb-8 mb-10 gap-4 bg-white">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-red-600 uppercase tracking-tighter">طلب تصنيع - معمل</h1>
                        <p className="text-sm text-slate-500 font-black italic">PRODUCTION TECHNICAL SPECIFICATIONS</p>
                    </div>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-black text-slate-900">{order.orderName}</h2>
                    <p className="text-sm text-slate-500 font-bold mt-1">الزبون: {customerName}</p>
                    <p className="text-xs font-mono text-slate-400 mt-1 uppercase">ID: #{order.id}</p>
                </div>
            </header>

            <main className="space-y-10 bg-white">
                <section>
                    <h3 className="text-lg font-bold mb-6 text-red-600 flex items-center gap-3">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        المواصفات الأساسية للتجهيز
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center">
                            <p className="text-slate-400 text-[10px] font-black uppercase mb-2">نوع المادة</p>
                            <p className="font-black text-xl text-slate-900">{order.mainAbjourType}</p>
                        </div>
                        <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center">
                            <p className="text-slate-400 text-[10px] font-black uppercase mb-2">اللون المطلوب</p>
                            <p className="font-black text-xl text-slate-900">{order.mainColor}</p>
                        </div>
                        <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center">
                            <p className="text-slate-400 text-[10px] font-black uppercase mb-2">عرض الشفرة</p>
                            <p className="font-black text-xl text-slate-900">{order.bladeWidth} سم</p>
                        </div>
                         <div className="p-5 bg-red-600 border-2 border-red-700 rounded-2xl text-center">
                            <p className="text-white/70 text-[10px] font-black uppercase mb-2">إجمالي الفتحات</p>
                            <p className="font-black text-3xl text-white leading-none">{order.openings.length}</p>
                        </div>
                    </div>
                    {order.scheduledDeliveryDate && (
                        <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-100 rounded-3xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                            <p className="text-yellow-700 text-xs font-black uppercase tracking-widest mb-1">تاريخ الجاهزية المطلوب</p>
                            <p className="font-black text-3xl text-yellow-900 leading-none">{order.scheduledDeliveryDate}</p>
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-3">
                        <span className="w-3 h-3 bg-slate-900 rounded-full"></span>
                        بيانات القص الفنية (سنتيمتر)
                    </h3>
                    <div className="rounded-3xl border-2 border-slate-100 overflow-hidden">
                        <Table className="w-full">
                            <TableHeader className="bg-slate-900">
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableHead className="p-5 text-center font-bold text-white w-16">#</TableHead>
                                    {showAbjourTypeColumn && <TableHead className="p-5 text-center font-bold text-white">التركيب</TableHead>}
                                    <TableHead className="p-5 text-center font-bold text-white text-base">طول الشفرة</TableHead>
                                    <TableHead className="p-5 text-center font-bold text-white text-base">العدد</TableHead>
                                    {showEndCapColumn && <TableHead className="p-5 text-center font-bold text-white">نهاية</TableHead>}
                                    {showAccessoriesColumn && <TableHead className="p-5 text-center font-bold text-white">مجاري</TableHead>}
                                    <TableHead className="p-5 text-center font-bold text-white">المساحة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.openings.map((opening, index) => {
                                    const area = (opening.codeLength * opening.numberOfCodes * order.bladeWidth / 10000).toFixed(2);
                                    return (
                                        <TableRow key={opening.serial} className="hover:bg-transparent border-b-2 border-slate-50 last:border-0 odd:bg-slate-50/30">
                                            <TableCell className="p-5 text-center font-black text-slate-300 text-lg">{index + 1}</TableCell>
                                            {showAbjourTypeColumn && <TableCell className="p-5 text-center font-black text-slate-700">{opening.abjourType}</TableCell>}
                                            <TableCell className="p-5 text-center font-mono font-black text-3xl text-red-600 bg-red-50/20">{opening.codeLength.toFixed(2)}</TableCell>
                                            <TableCell className="p-5 text-center font-mono font-black text-3xl text-slate-900">{opening.numberOfCodes}</TableCell>
                                            {showEndCapColumn && <TableCell className="p-5 text-center font-bold text-slate-600">{opening.hasEndCap ? '✓' : '-'}</TableCell>}
                                            {showAccessoriesColumn && <TableCell className="p-5 text-center font-bold text-slate-600">{opening.hasAccessories ? '✓' : '-'}</TableCell>}
                                            <TableCell className="p-5 text-center font-mono font-bold text-slate-400">{area} م²</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-6 p-8 bg-slate-100 rounded-3xl font-black flex justify-between items-center">
                        <span className="text-xl text-slate-700 uppercase tracking-tight">إجمالي مساحة القص المطلوبة:</span>
                        <span className="font-mono text-4xl text-slate-900 leading-none">{order.totalArea.toFixed(2)} م²</span>
                    </div>
                </section>
                
                {order.accessories && order.accessories.length > 0 && (
                     <section>
                        <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-3">
                            <span className="w-3 h-3 bg-slate-900 rounded-full"></span>
                            قائمة الملحقات والإضافات
                        </h3>
                        <div className="rounded-3xl border-2 border-slate-100 overflow-hidden">
                            <Table className="w-full">
                                <TableHeader className="bg-slate-200">
                                    <TableRow className="hover:bg-transparent border-0">
                                        <TableHead className="p-5 text-center font-black text-slate-700 uppercase">اسم الملحق</TableHead>
                                        <TableHead className="p-5 text-center font-black text-slate-700 uppercase">الكمية</TableHead>
                                        <TableHead className="p-5 text-center font-black text-slate-700 uppercase">الوحدة</TableHead>
                                        <TableHead className="p-5 text-center font-black text-slate-700 uppercase">الأولوية</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.accessories.map((acc, index) => (
                                        <TableRow key={index} className="hover:bg-transparent border-b-2 border-slate-50 last:border-0">
                                            <TableCell className="p-5 text-center font-bold text-lg text-slate-800">{acc.name}</TableCell>
                                            <TableCell className="p-5 text-center font-mono font-black text-2xl text-slate-900">{acc.quantity}</TableCell>
                                            <TableCell className="p-5 text-center font-bold text-slate-500">{acc.unit}</TableCell>
                                            <TableCell className="p-5 text-center">
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${acc.type === 'required' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
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

            <footer className="mt-20 text-center border-t-4 border-slate-50 pt-10 bg-white">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic">TECHNICAL PRODUCTION DOCUMENT - TALAB ABAJOUR SMART SYSTEM</p>
            </footer>
        </div>
    );
}