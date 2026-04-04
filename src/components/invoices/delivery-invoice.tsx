'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";

export function DeliveryInvoice({ order, customer }: { order: Order, customer?: User }) {
    const customerName = customer?.name || order.customerName;
    const customerPhone = customer?.phone || order.customerPhone;

    return (
        <div id="delivery-invoice" className="bg-white p-10 rounded-lg border border-border shadow-sm text-slate-950 w-full max-w-[850px] mx-auto">
            <header className="flex flex-row justify-between items-start border-b-2 border-slate-100 pb-8 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-tight">إيصال تسليم وشحن</h1>
                        <p className="text-sm text-slate-500 font-bold">DELIVERY NOTIFICATION</p>
                    </div>
                </div>
                <div className="text-left w-auto">
                    <p className="text-sm text-slate-500 font-bold">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs font-mono text-slate-400 mt-1">Order REF: #{order.id}</p>
                </div>
            </header>

            <main>
                <section className="mb-10">
                    <h3 className="text-lg font-bold mb-4 text-blue-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        بيانات العميل والموقع
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm p-8 border rounded-2xl bg-blue-50/30">
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs font-bold">اسم العميل بالكامل</span> <span className="font-black text-xl text-slate-900">{customerName}</span></div>
                        <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs font-bold">رقم الهاتف للتواصل</span> <span className="font-mono font-black text-xl text-slate-900" dir="ltr">{customerPhone}</span></div>
                        <div className="md:col-span-2 flex flex-col gap-2 mt-2 pt-4 border-t border-blue-100">
                            <span className="text-slate-500 text-xs font-bold italic">تفاصيل موقع التسليم (العنوان)</span> 
                            <p className="font-bold text-lg text-slate-800 leading-relaxed">{order.deliveryAddress}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-900 rounded-full"></span>
                        ملخص التحصيل المالي
                    </h3>
                    <div className="p-8 border-2 border-dashed border-blue-200 rounded-2xl bg-white space-y-6 max-w-md mx-auto text-center shadow-sm">
                        <div className="space-y-2">
                            <p className="text-slate-500 text-sm font-bold uppercase">المنتجات المشحونة</p>
                            <p className="font-black text-xl text-slate-900">أباجور {order.mainAbjourType}</p>
                            <p className="text-blue-600 font-bold text-sm">عدد الفتحات الإجمالي: {order.openings.length}</p>
                        </div>
                        
                        <Separator className="bg-slate-100" />

                        <div className="space-y-3">
                            <p className="text-slate-500 text-xs font-bold">المبلغ الإجمالي المطلوب تحصيله</p>
                            <div className="p-4 bg-blue-600 text-white rounded-xl">
                                <p className="font-mono font-black text-4xl leading-none">${(order.totalCost + (order.deliveryCost || 0)).toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div className="pt-4 flex flex-col gap-2">
                            <p className="text-xs text-slate-400 font-bold italic">
                               يرجى توقيع العميل عند الاستلام والتأكد من تطابق البيانات.
                            </p>
                            <div className="h-16 border-b-2 border-slate-100 w-full mt-4 flex items-end justify-center">
                                <span className="text-[10px] text-slate-300 font-bold uppercase">توقيع المستلم</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-16 text-center text-[10px] text-slate-400 border-t pt-8">
                <p className="font-bold tracking-widest uppercase italic">مستند تسليم لوجستي - طلب أباجور</p>
            </footer>
        </div>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-px w-full ${className}`} />;
}
