'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";

export function DeliveryInvoice({ order, customer }: { order: Order, customer?: User }) {
    const customerName = customer?.name || order.customerName;
    const customerPhone = customer?.phone || order.customerPhone;

    return (
        <div id="delivery-invoice" className="bg-white p-12 rounded-none border-none text-slate-950 w-[800px] min-w-[800px] max-w-[800px] mx-auto overflow-hidden shadow-none">
            <header className="flex flex-row justify-between items-center border-b-4 border-blue-100 pb-8 mb-10 gap-4 bg-white">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-tighter">إيصال تسليم وشحن</h1>
                        <p className="text-sm text-slate-500 font-black italic">LOGISTICS & DELIVERY NOTICE</p>
                    </div>
                </div>
                <div className="text-left">
                    <p className="text-sm text-slate-500 font-black uppercase tracking-tight">تاريخ الطباعة:</p>
                    <p className="font-bold text-slate-900">{new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs font-mono text-slate-400 mt-1">ORDER ID: #{order.id}</p>
                </div>
            </header>

            <main className="space-y-10 bg-white">
                <section>
                    <h3 className="text-lg font-bold mb-6 text-blue-600 flex items-center gap-3">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        بيانات العميل والموقع
                    </h3>
                    <div className="grid grid-cols-2 gap-8 p-10 border-2 border-blue-50 rounded-3xl bg-blue-50/20 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">اسم المستلم</span> 
                            <span className="font-black text-2xl text-slate-900 leading-none">{customerName}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">رقم الاتصال</span> 
                            <span className="font-mono font-black text-2xl text-slate-900 leading-none" dir="ltr">{customerPhone}</span>
                        </div>
                        <div className="col-span-2 mt-4 pt-6 border-t-2 border-blue-100/50 flex flex-col gap-3">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">موقع التسليم التفصيلي</span> 
                            <p className="font-bold text-xl text-slate-800 leading-relaxed">{order.deliveryAddress}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-3">
                        <span className="w-3 h-3 bg-slate-900 rounded-full"></span>
                        ملخص التحصيل والتسليم
                    </h3>
                    <div className="p-10 border-4 border-dashed border-blue-100 rounded-3xl bg-white space-y-8 max-w-[500px] mx-auto text-center shadow-lg relative">
                        <div className="space-y-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">المنتج المشحون</p>
                            <p className="font-black text-2xl text-slate-900">أباجور طراز {order.mainAbjourType}</p>
                            <p className="text-blue-600 font-black text-sm uppercase">حمولة إجمالية: {order.openings.length} قطع</p>
                        </div>
                        
                        <div className="h-px w-full bg-slate-100"></div>

                        <div className="space-y-4">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">المبلغ الصافي المطلوب تحصيله عند الاستلام</p>
                            <div className="py-6 px-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                                <p className="font-mono font-black text-5xl leading-none tracking-tighter">${(order.totalCost + (order.deliveryCost || 0)).toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div className="pt-6 space-y-6">
                            <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed px-4">
                               يرجى التوقيع أدناه بعد التأكد من سلامة البضاعة وتطابق المواصفات الفنية مع طلبكم.
                            </p>
                            <div className="flex justify-center pt-4">
                                <div className="w-full h-24 border-b-2 border-slate-200 flex items-end justify-center pb-2">
                                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">توقيع العميل المستلم</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-20 text-center border-t-2 border-slate-50 pt-8 bg-white">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] italic">OFFICIAL LOGISTICS DOCUMENT - NOT AN INVOICE</p>
            </footer>
        </div>
    );
}