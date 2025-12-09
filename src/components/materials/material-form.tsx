
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { createMaterial, updateMaterial } from '@/lib/actions';
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AbjourTypeData } from '@/lib/definitions';

const materialSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب ويجب أن يكون حرفين على الأقل.'),
  bladeWidth: z.coerce.number().min(0.1, 'عرض الشفرة مطلوب.'),
  pricePerSquareMeter: z.coerce.number().min(0.1, 'السعر مطلوب.'),
  colors: z.string().min(1, 'يجب إضافة لون واحد على الأقل.'),
  stock: z.coerce.number().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormProps {
    material?: AbjourTypeData;
}

export function MaterialForm({ material }: MaterialFormProps) {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name || '',
      bladeWidth: material?.bladeWidth || undefined,
      pricePerSquareMeter: material?.pricePerSquareMeter || undefined,
      colors: material?.colors.join(',') || '',
      stock: material?.stock || 0,
    },
  });

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isEditing = !!material;

  const onSubmit = (data: MaterialFormValues) => {
     startTransition(async () => {
        const action = isEditing ? updateMaterial : createMaterial;
        const result = await action(data);
        if (result?.success) {
            toast({
                title: isEditing ? 'تم تحديث المادة بنجاح!' : 'تم إنشاء المادة بنجاح!',
                description: `تم حفظ التغييرات على ${data.name}.`,
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
            <CardTitle>تفاصيل المادة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المادة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: شراع" disabled={isEditing} />
                  </FormControl>
                  <FormDescription>
                    لا يمكن تغيير الاسم بعد الإنشاء.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditing && material && (
                <FormItem>
                    <FormLabel>الكمية الحالية في المخزون (م²)</FormLabel>
                     <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <Input readOnly value={material.stock.toFixed(2)} className="w-auto font-mono bg-muted" />
                    </div>
                     <FormDescription>
                        هذه هي الكمية المتاحة حاليًا. يتم تحديثها تلقائيًا مع الطلبات والمشتريات.
                    </FormDescription>
                </FormItem>
            )}
            <FormField
              control={form.control}
              name="bladeWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عرض الشفرة (سم)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricePerSquareMeter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر المتر المربع ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الألوان المتاحة</FormLabel>
                   <FormControl>
                    <Input {...field} placeholder="أبيض,أسود,بيج" />
                  </FormControl>
                  <FormDescription>
                    أدخل الألوان مفصولة بفاصلة (comma).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditing && (
                 <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>الكمية المبدئية في المخزون (م²)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>هذه هي الكمية التي تبدأ بها في المخزون.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'حفظ التغييرات' : 'إنشاء مادة'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

    