'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { Order, User, Opening } from '@/lib/definitions';
import { BrandLogo } from '../icons';

interface PrintOrderProps {
  order: Order;
  customer?: User | null;
}

const OrderPrintLayout = React.forwardRef<
  HTMLDivElement,
  { order: Order; customerName: string }
>(({ order, customerName }, ref) => {
  const totalArea = order.openings.reduce((acc, op) => acc + op.codeLength * op.numberOfCodes * 0.05, 0);

  return (
    <div ref={ref} className="bg-white p-8 text-black font-sans text-right" dir="rtl">
        <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-8">
            <div className="flex items-center gap-4">
                <BrandLogo />
                <div>
                    <h1 className="text-2xl font-bold">طلب أباجور</h1>
                    <p className="text-sm text-gray-500">نظام إدارة طلبات الأباجور</p>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold">ملخص الطلب</h2>
                <p className="text-sm">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
        </header>
        
        <main>
            <section className="mb-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base p-4 border rounded-lg bg-gray-50">
                    <div className="font-bold">اسم الطلب:</div>
                    <div className="text-gray-800">{order.orderName}</div>
                    <div className="font-bold">رقم الطلب:</div>
                    <div className="text-gray-800">{order.id}</div>
                    <div className="font-bold">العميل:</div>
                    <div className="text-gray-800">{customerName}</div>
                    <div className="font-bold">تاريخ الطلب:</div>
                    <div className="text-gray-800">{order.date}</div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold text-center mb-4 border-t pt-4">تفاصيل القطع للمعمل</h3>
                <table className="w-full border-collapse text-sm text-center">
                    <thead className="bg-gray-200 font-bold">
                    <tr>
                        <th className="border p-2">رقم القطعة</th>
                        <th className="border p-2">اسم القطعة</th>
                        <th className="border p-2">اللون</th>
                        <th className="border p-2">طول الشفرة (م)</th>
                        <th className="border p-2">عدد الشفرات</th>
                        <th className="border p-2">مع نهاية</th>
                        <th className="border p-2">إكسسوارات</th>
                        <th className="border p-2">المساحة (م²)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {order.openings.map((opening: Opening) => {
                        const area = (opening.codeLength * opening.numberOfCodes * 0.05).toFixed(2);
                        return (
                        <tr key={opening.serial} className="even:bg-gray-50">
                            <td className="border p-2">{opening.serial}</td>
                            <td className="border p-2">{opening.abjourType}</td>
                            <td className="border p-2">{opening.color}</td>
                            <td className="border p-2">{opening.codeLength}</td>
                            <td className="border p-2">{opening.numberOfCodes}</td>
                            <td className="border p-2">{opening.hasEndCap ? 'نعم' : 'لا'}</td>
                            <td className="border p-2">{opening.hasAccessories ? 'نعم' : 'لا'}</td>
                            <td className="border p-2">{area}</td>
                        </tr>
                        );
                    })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan={7} className="border p-2 text-left">المجموع</td>
                            <td className="border p-2">{totalArea.toFixed(2)} م²</td>
                        </tr>
                    </tfoot>
                </table>
            </section>
        </main>

        <footer className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
            <p>هذا المستند تم إنشاؤه بواسطة نظام طلب أباجور.</p>
            <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
});
OrderPrintLayout.displayName = 'OrderPrintLayout';

const PrintTrigger = React.forwardRef<HTMLButtonElement>((props, ref) => {
    return (
      <Button ref={ref} variant="outline">
        <Printer className="ml-2 h-4 w-4" />
        طباعة
      </Button>
    );
});
PrintTrigger.displayName = 'PrintTrigger';


export function PrintOrder({ order, customer }: PrintOrderProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const customerName = customer?.name || order.customerName;

  return (
    <div>
       <ReactToPrint
        trigger={() => <PrintTrigger />}
        content={() => componentRef.current}
        documentTitle={`طلب-${order.id}-${order.orderName}`}
        bodyClass="bg-white"
      />
      <div className="hidden">
        <OrderPrintLayout order={order} customerName={customerName} ref={componentRef} />
      </div>
    </div>
  );
}
