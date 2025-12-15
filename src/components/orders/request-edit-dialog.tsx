
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MessageSquareQuote, Loader2 } from "lucide-react";
import type { Order } from "@/lib/definitions";
import { requestOrderEdit } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const editRequestSchema = z.object({
  notes: z.string().min(10, 'الرجاء كتابة ملاحظات التعديل (10 أحرف على الأقل).'),
});

type EditRequestFormValues = z.infer<typeof editRequestSchema>;

interface RequestEditDialogProps {
  order: Order;
}

export function RequestEditDialog({ order }: RequestEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<EditRequestFormValues>({
    resolver: zodResolver(editRequestSchema),
    defaultValues: { notes: '' },
  });

  const onSubmit = (data: EditRequestFormValues) => {
    startTransition(async () => {
      const result = await requestOrderEdit(order.id, data);
      if (result.success) {
        toast({
          title: "تم إرسال طلب التعديل",
          description: "لقد أرسلنا طلبك إلى الإدارة وسيتواصلون معك قريبًا.",
        });
        setIsOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "فشل إرسال الطلب",
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
         <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            disabled={order.isEditRequested}
          >
            <MessageSquareQuote className="ml-2 h-4 w-4" />
            {order.isEditRequested ? "تم طلب التعديل" : "طلب تعديل من الإدارة"}
          </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>طلب تعديل للطلب: {order.orderName}</DialogTitle>
          <DialogDescription>
            يرجى كتابة التعديلات المطلوبة بوضوح في الحقل أدناه. سيتم إرسالها إلى الإدارة للمراجعة.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التعديلات المطلوبة</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: تغيير لون الفتحة الثانية إلى أبيض، زيادة عدد الشفرات في الفتحة الأولى إلى 50..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إرسال طلب التعديل
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
