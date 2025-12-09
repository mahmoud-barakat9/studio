
'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import React, { useTransition, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AbjourTypeData, Supplier } from '@/lib/definitions';
import { useRouter } from 'next/navigation';

const purchaseSchema = z.object({
  materialName: z.string().min(1, 'اسم المادة مطلوب.'),
  color: z.string().min(1, 'اللون مطلوب.'),
  supplierName: z.string().min(1, 'اسم المورد مطلوب.'),
  quantity: z.coerce.number().min(0.1, 'الكمية مطلوبة ويجب أن تكون أكبر من صفر.'),
  purchasePricePerMeter: z.coerce.number().min(0.1, 'سعر الشراء مطلوب ويجب أن يكون أكبر من صفر.'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
    materials: AbjourTypeData[];
    suppliers: Supplier[];
}

export function PurchaseForm({ materials, suppliers }: PurchaseFormProps) {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      materialName: '',
      color: '',
      supplierName: '',
      quantity: undefined,
      purchasePricePerMeter: undefined,
    },
  });

  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const watchMaterialName = useWatch({ control: form.control, name: 'materialName' });

  const availableColors = useMemo(() => {
    const selectedMaterial = materials.find(m => m.name === watchMaterialName);
    return selectedMaterial?.colors || [];
  }, [watchMaterialName, materials]);

  useEffect(() => {
    const currentColor = form.getValues('color');
    if (watchMaterialName && !availableColors.includes(currentColor)) {
        form.setValue('color', '');
    }
  }, [watchMaterialName, availableColors, form]);

  const onSubmit = (data: PurchaseFormValues) => {
     startTransition(async () => {
        const result = await createPurchase(data);
        if (result?.success) {
            toast({
                title: 'تم تسجيل فاتورة الشراء بنجاح!',
                description: `تمت إضافة ${data.quantity} م² إلى مخزون ${data.materialName}.`,
            });
            setTimeout(() => {
                router.push('/admin/inventory');
            }, 2000);
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
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المورد</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر المورد" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اللون</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={!watchMaterialName}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر اللون" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableColors.map(color => (
                            <SelectItem key={color} value={color}>
                            {color}
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
                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} />
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
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
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
