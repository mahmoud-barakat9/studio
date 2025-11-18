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
import { updateUser } from '@/lib/actions';
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';

const userSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('بريد إلكتروني غير صالح.'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user'], { required_error: 'الدور مطلوب.' }),
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export function EditUserForm({ user }: { user: User }) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
    },
  });

  const { toast } = useToast();
  const [isSubmitPending, startSubmitTransition] = useTransition();

  const onSubmit = (data: UserFormValues) => {
     startSubmitTransition(async () => {
        const result = await updateUser(user.id, data);
        if (result?.success) {
            toast({
                title: 'تم تحديث المستخدم بنجاح!',
                description: `تم حفظ التغييرات على ملف ${data.name}.`,
            });
        }
     });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المستخدم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
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
                  <FormLabel>رقم الهاتف</FormLabel>
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
                  <FormLabel>كلمة المرور الجديدة</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="اتركها فارغة لعدم التغيير" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitPending}
            >
              {isSubmitPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
