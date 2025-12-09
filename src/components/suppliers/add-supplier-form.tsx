
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
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createSupplier } from '@/lib/actions';
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';

const supplierSchema = z.object({
  name: z.string().min(2, 'اسم المورد مطلوب ويجب أن يكون حرفين على الأقل.'),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export function AddSupplierForm() {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
    },
  });

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: SupplierFormValues) => {
     startTransition(async () => {
        const result = await createSupplier(data);
        if (result?.success) {
            toast({
                title: 'تمت إضافة المورد بنجاح!',
                description: `تم حفظ المورد "${data.name}".`,
            });
            form.reset();
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
    <Card>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>إضافة مورد جديد</CardTitle>
                <CardDescription>أضف موردًا جديدًا إلى قائمتك.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>اسم المورد</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="مثال: شركة الأباجور الحديثة" />
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
                حفظ المورد
                </Button>
            </CardFooter>
        </form>
        </Form>
    </Card>
  );
}
