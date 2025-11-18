"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Send } from "lucide-react";
import type { Order, User, Opening } from "@/lib/definitions";

interface WhatsappShareProps {
    order: Order;
    customer?: User | null;
}

const generateOrderSummary = (order: Order, customerName: string) => {
    let summary = `*ملخص طلب أباجور*\n\n`;
    summary += `*اسم الطلب:* ${order.orderName}\n`;
    summary += `*رقم الطلب:* ${order.id}\n`;
    summary += `*العميل:* ${customerName}\n`;
    summary += `*تاريخ الطلب:* ${order.date}\n`;
    summary += `*التكلفة الإجمالية:* ${order.totalCost.toFixed(2)}$\n\n`;
    summary += `*--- تفاصيل الفتحات ---*\n`;

    order.openings.forEach((opening: Opening, index: number) => {
        summary += `\n*الفتحة ${index + 1}:*\n`;
        summary += `  - الرقم التسلسلي: ${opening.serial}\n`;
        summary += `  - النوع: ${opening.abjourType}\n`;
        summary += `  - اللون: ${opening.color}\n`;
        summary += `  - طول الكود: ${opening.codeLength}م\n`;
        summary += `  - عدد الأكواد: ${opening.numberOfCodes}\n`;
        if (opening.hasEndCap) summary += `  - مع غطاء طرفي\n`;
        if (opening.hasAccessories) summary += `  - مع إكسسوارات\n`;
    });

    return encodeURIComponent(summary);
};

export function WhatsappShare({ order, customer }: WhatsappShareProps) {
  const [phoneNumber, setPhoneNumber] = useState(order.customerPhone || "");
  const [open, setOpen] = useState(false);

  const handleShare = () => {
    if (!phoneNumber) return;
    const message = generateOrderSummary(order, customer?.name || order.customerName);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="ml-2 h-4 w-4" />
          مشاركة عبر واتساب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>مشاركة تفاصيل الطلب</DialogTitle>
          <DialogDescription>
            أدخل رقم واتساب لإرسال ملخص الطلب.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right col-span-1">
              رقم الهاتف
            </Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="col-span-3"
              placeholder="مثال: 9665xxxxxxxx"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleShare}>
            <Send className="ml-2 h-4 w-4" />
            إرسال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
