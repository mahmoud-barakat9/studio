
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Loader2 } from "lucide-react";
import React, { useState, useTransition } from "react";

interface ScheduleOrderDialogProps {
  onSchedule: (days: number) => Promise<void>;
}

export function ScheduleOrderDialog({ onSchedule }: ScheduleOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState<number | ''>('');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (typeof days === 'number' && days > 0) {
      startTransition(async () => {
        await onSchedule(days);
        setIsOpen(false);
        setDays('');
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
            <CalendarClock className="ml-2 h-4 w-4" />
            تحديد الجدول الزمني
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تحديد الجدول الزمني للطلب</DialogTitle>
          <DialogDescription>
            أدخل عدد الأيام المتوقعة لتجهيز هذا الطلب. سيتم حساب تاريخ التسليم المتوقع بناءً على هذا المدخل.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="days" className="text-right">
              الأيام
            </Label>
            <Input
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="col-span-3"
              placeholder="مثال: 7"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
          <Button type="submit" onClick={handleSave} disabled={isPending || !days || days <= 0}>
            {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ وتأكيد الجدولة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    