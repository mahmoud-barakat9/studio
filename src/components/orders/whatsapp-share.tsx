'use client';

import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Loader2, Send } from 'lucide-react';
import type { Order, User, Opening } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

interface WhatsappShareProps {
  order: Order;
  customer?: User | null;
}

const OrderSummaryTable = React.forwardRef<
  HTMLDivElement,
  { order: Order; customerName: string }
>(({ order, customerName }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-4 text-black"
      style={{ width: '500px' }}
    >
      <h2 className="text-xl font-bold text-center mb-2">ملخص الطلب</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
        <div className="font-bold">اسم الطلب:</div>
        <div>{order.orderName}</div>
        <div className="font-bold">رقم الطلب:</div>
        <div>{order.id}</div>
        <div className="font-bold">العميل:</div>
        <div>{customerName}</div>
        <div className="font-bold">تاريخ الطلب:</div>
        <div>{order.date}</div>
        <div className="font-bold">عدد الفتحات:</div>
        <div>{order.openings.length}</div>
        <div className="font-bold">التكلفة الإجمالية:</div>
        <div>${order.totalCost.toFixed(2)}</div>
      </div>

      <h3 className="text-lg font-bold text-center mt-4 mb-2">تفاصيل القطع</h3>
      <table className="w-full border-collapse text-xs text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-1">رقم القطعة</th>
            <th className="border p-1">اسم القطعة</th>
            <th className="border p-1">طول الشفرة</th>
            <th className="border p-1">عدد الشفرات</th>
            <th className="border p-1">مع نهاية</th>
            <th className="border p-1">المساحة (م²)</th>
          </tr>
        </thead>
        <tbody>
          {order.openings.map((opening: Opening) => {
            const area = (opening.codeLength * opening.numberOfCodes * 0.05).toFixed(2);
            return (
              <tr key={opening.serial}>
                <td className="border p-1">{opening.serial}</td>
                <td className="border p-1">{opening.abjourType}</td>
                <td className="border p-1">{opening.codeLength}م</td>
                <td className="border p-1">{opening.numberOfCodes}</td>
                <td className="border p-1">{opening.hasEndCap ? 'نعم' : 'لا'}</td>
                <td className="border p-1">{area}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
OrderSummaryTable.displayName = 'OrderSummaryTable';

export function WhatsappShare({ order, customer }: WhatsappShareProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const { toast } = useToast();
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleShare = async () => {
    if (!summaryRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(summaryRef.current, { scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();

      if (isShareSupported) {
        await navigator.share({
          files: [
            new File([blob], `order-${order.id}.png`, {
              type: 'image/png',
            }),
          ],
          title: `ملخص الطلب: ${order.orderName}`,
          text: `تفاصيل طلب رقم ${order.id}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'المشاركة غير مدعومة',
          description: 'متصفحك لا يدعم خاصية المشاركة.',
        });
      }
    } catch (error) {
      console.error('Error sharing order:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم نتمكن من مشاركة الطلب. حاول مرة أخرى.',
      });
    } finally {
      setIsGenerating(false);
      setOpen(false);
    }
  };

  const customerName = customer?.name || order.customerName;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="ml-2 h-4 w-4" />
          مشاركة الطلب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>مشاركة ملخص الطلب</DialogTitle>
          <DialogDescription>
            سيتم إنشاء صورة احترافية تحتوي على تفاصيل الطلب لمشاركتها.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 relative">
            <div className="mx-auto w-fit border rounded-md overflow-hidden">
             <OrderSummaryTable order={order} customerName={customerName} ref={summaryRef} />
            </div>
            {isGenerating && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleShare}
            disabled={isGenerating || !isShareSupported}
          >
            {isGenerating ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="ml-2 h-4 w-4" />
            )}
            {isGenerating ? 'جارٍ إنشاء الصورة...' : 'مشاركة الآن'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
