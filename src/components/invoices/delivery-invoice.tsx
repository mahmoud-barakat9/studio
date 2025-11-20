'use client';
import type { Order, User } from "@/lib/definitions";
import { BrandLogo } from "@/components/icons";

export function DeliveryInvoice({ order, customer }: { order: Order, customer?: User }) {
    const customerName = customer?.name || order.customerName;
    const customerPhone = customer?.phone || order.customerPhone;

    return (
        <div id="delivery-invoice" className="bg-card p-6 sm:p-10 rounded-lg shadow-sm border border-border/50 text-foreground">
            <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-muted pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div>
                        <h1 className="text-3xl font-bold text-primary">إشعار تسليم</h1>
                        <p className="text-sm text-muted-foreground">معلومات تسليم الطلب</p>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0">
                    <p className="text-sm text-muted-foreground">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main>
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">معلومات التسليم الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base p-4 border rounded-lg bg-muted/30">
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">رقم الطلب</span> <span className="font-mono">{order.id}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">تاريخ الطلب</span> <span>{order.date}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">اسم العميل</span> <span className="font-semibold">{customerName}</span></div>
                        <div className="flex flex-col"><span className="font-bold text-muted-foreground text-sm">رقم هاتف العميل</span> <span className="font-mono">{customerPhone}</span></div>
                        <div className="md:col-span-2 flex flex-col"><span className="font-bold text-muted-foreground text-sm">عنوان التوصيل</span> <p className="font-semibold">{order.deliveryAddress}</p></div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-center mb-4 border-t pt-8">ملخص الشحنة</h3>
                    <div className="p-6 border rounded-lg bg-muted/30 space-y-3 max-w-md mx-auto text-center">
                        <div className="flex justify-between items-center">
                            <span>المنتج:</span> 
                            <span className="font-semibold">طلب أباجور - {order.mainAbjourType} ({order.mainColor})</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span>عدد الفتحات:</span> 
                            <span className="font-mono font-semibold">{order.openings.length}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg text-primary pt-2">
                            <span>المبلغ المطلوب عند الاستلام:</span> 
                            <span className="font-mono">${(order.totalCost + (order.deliveryCost || 0)).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">
                           يرجى التأكد من استلام المبلغ الصحيح عند تسليم الطلب.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="mt-16 text-center text-xs text-gray-500 border-t pt-6">
                <p>مستند للتوصيل فقط. صادر من نظام طلب أباجور.</p>
            </footer>
        </div>
    );
}
