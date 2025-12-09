
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createPurchase } from '@/lib/actions';
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AbjourTypeData } from '@/lib/definitions';

const purchaseSchema = z.object({
  materialName: z.string().min(1, 'اسم المادة مطلوب.'),
  quantity: z.coerce.number().min(0.1, 'الكمية مطلوبة ويجب أن تكون أكبر من صفر.'),
  purchasePricePerMeter: z.coerce.number().min(0.1, 'سعر الشراء مطلوب ويجب أن يكون أكبر من صفر.'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
    materials: AbjourTypeData[];
}

export function PurchaseForm({ materials }: PurchaseFormProps) {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      materialName: '',
      quantity: 0,
      purchasePricePerMeter: 0,
    },
  });

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: PurchaseFormValues) => {
     startTransition(async () => {
        const result = await createPurchase(data);
        if (result?.success) {
            toast({
                title: 'تم تسجيل فاتورة الشراء بنجاح!',
                description: `تمت إضافة ${data.quantity} م² إلى مخزون ${data.materialName}.`,
            });
        } else if (result?.error) {
             toast({
                variant: 'destructive',
                title: 'حدث خطأ',
                description: result.error,
            });
        }
     });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل فاتورة الشراء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="materialName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المادة المشتراة</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر المادة من القائمة" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {materials.map(material => (
                            <SelectItem key={material.name} value={material.name}>
                            {material.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكمية المشتراة (م²)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePricePerMeter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الشراء للمتر المربع ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              حفظ الفاتورة وإضافة للمخزون
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
