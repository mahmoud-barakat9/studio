
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createUser } from '@/lib/actions';
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const userSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('بريد إلكتروني غير صالح.'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user'], { required_error: 'الدور مطلوب.' }),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'),
});

type UserFormValues = z.infer<typeof userSchema>;

export function AddUserForm() {
  const router = useRouter();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
    },
  });

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: UserFormValues) => {
     startTransition(async () => {
        const result = await createUser(data);
        if (result?.success) {
            toast({
                title: 'تم إنشاء المستخدم بنجاح!',
                description: `تم إنشاء حساب لـ ${data.name}.`,
            });
            router.push('/admin/users');
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
            <CardTitle>تفاصيل المستخدم الجديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="admin">مسؤول</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
              إنشاء المستخدم
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
