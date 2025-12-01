
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import type { Order } from "@/lib/definitions";
import { updateOrderPrice } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface EditPriceDialogProps {
  order: Order;
  isEditable: boolean;
  onPriceUpdate: (updatedOrder: Order) => void;
  children: React.ReactNode;
}

export function EditPriceDialog({ order, isEditable, onPriceUpdate, children }: EditPriceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState<number | ''>(order.overriddenPricePerSquareMeter ?? '');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!isEditable) return;
    if (open) {
      // When opening, set the price from the order
      setPrice(order.overriddenPricePerSquareMeter ?? '');
    }
    setIsOpen(open);
  };
  
  const handleSave = () => {
    const newPrice = typeof price === 'number' ? price : null;
    
    startTransition(async () => {
      const result = await updateOrderPrice(order.id, newPrice);
      if (result.success && result.updatedOrder) {
        onPriceUpdate(result.updatedOrder);
        toast({
          title: "تم تحديث السعر",
          description: `تم تحديث سعر المتر للطلب ${order.orderName}.`,
        });
        setIsOpen(false);
      } else {
         toast({
            variant: "destructive",
            title: "فشل تحديث السعر",
            description: result.error || "حدث خطأ غير متوقع.",
        });
      }
    });
  };

  const handleReset = () => {
      startTransition(async () => {
        const result = await updateOrderPrice(order.id, null);
         if (result.success && result.updatedOrder) {
            onPriceUpdate(result.updatedOrder);
            toast({
                title: "تمت استعادة السعر الافتراضي",
            });
            setIsOpen(false);
         }
      });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={!isEditable} onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>تعديل سعر المتر المربع</DialogTitle>
          <DialogDescription>
            أدخل السعر الجديد لهذا الطلب. سيتم استخدامه لحساب التكلفة الإجمالية.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              السعر
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="col-span-3"
              placeholder={`الافتراضي: $${order.pricePerSquareMeter.toFixed(2)}`}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={isPending}>استعادة الافتراضي</Button>
            <div className="flex gap-2">
                <DialogClose asChild>
                    <Button variant="outline" disabled={isPending}>إلغاء</Button>
                </DialogClose>
                <Button type="submit" onClick={handleSave} disabled={isPending}>
                    {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    حفظ السعر
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
