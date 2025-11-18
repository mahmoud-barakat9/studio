'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
  CardDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Wand2, Loader2 } from 'lucide-react';
import {
  calculateAbjourDimensions,
  generateOrderName,
  createOrder as createOrderAction,
} from '@/lib/actions';
import { useFormState } from 'react-dom';
import React, { useEffect, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';

const openingSchema = z.object({
  serial: z.string().min(1, 'الرقم التسلسلي مطلوب.'),
  abjourType: z.string().min(1, 'النوع مطلوب.'),
  color: z.string().min(1, 'اللون مطلوب.'),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  codeLength: z.coerce.number().min(0.1, 'الطول مطلوب.'),
  numberOfCodes: z.coerce.number().int().min(1, 'عدد الأكواد مطلوب.'),
  hasEndCap: z.boolean().default(false),
  hasAccessories: z.boolean().default(false),
});

const baseOrderSchema = z.object({
  orderName: z.string().min(1, 'اسم الطلب مطلوب.'),
  openings: z.array(openingSchema).min(1, 'يجب إضافة فتحة واحدة على الأقل.'),
});

const userOrderSchema = baseOrderSchema.extend({
  customerName: z.string().min(1, 'اسم العميل مطلوب.'),
  customerPhone: z.string().min(1, 'رقم الهاتف مطلوب.'),
});

const adminOrderSchema = baseOrderSchema.extend({
    userId: z.string().optional(),
    newUserName: z.string().optional(),
    newUserEmail: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.userId === 'new') {
        return !!data.newUserName && !!data.newUserEmail;
      }
      return !!data.userId && data.userId !== 'new';
    },
    {
      message: 'يجب اختيار مستخدم حالي أو إدخال تفاصيل مستخدم جديد.',
      path: ['userId'],
    }
  );


type OrderFormValues = z.infer<typeof userOrderSchema & typeof adminOrderSchema>;

const abjourTypes = ['قياسي', 'ضيق', 'عريض'];
const colors = ['أبيض', 'بيج', 'رمادي', 'أسود', 'خشبي', 'فضي'];

export function OrderForm({ isAdmin = false, users: allUsers = [] }: { isAdmin?: boolean, users?: User[] }) {
  const orderSchema = isAdmin ? adminOrderSchema : userOrderSchema;
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: 'فاطمة الزهراء',
      customerPhone: '555-5678',
      orderName: '',
      openings: [],
      userId: '',
      newUserName: '',
      newUserEmail: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'openings',
  });

  const { toast } = useToast();

  const [nameState, generateNameAction] = useFormState(generateOrderName, null);
  const [isNamePending, startNameTransition] = useTransition();
  const [isDimPending, startDimTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();

  const watchUserId = form.watch('userId');
  const watchedOpenings = form.watch('openings');

  const totalArea = watchedOpenings.reduce(
    (acc, op) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * 0.05,
    0
  );
  const totalCost = totalArea * 120;


  useEffect(() => {
    if (nameState?.data?.orderName) {
      form.setValue('orderName', nameState.data.orderName);
      toast({
        title: 'تم إنشاء اسم مقترح!',
        description: 'تم ملء اسم الطلب لك.',
      });
    }
    if (nameState?.error) {
      toast({ variant: 'destructive', title: 'خطأ', description: nameState.error });
    }
  }, [nameState, form, toast]);

  const handleSuggestName = () => {
    const firstOpening = form.getValues('openings.0');
    if (!firstOpening) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء إضافة فتحة واحدة على الأقل لإنشاء اسم.',
      });
      return;
    }
    startNameTransition(() => {
      generateNameAction(firstOpening);
    });
  };

  const handleCalculateDims = (index: number) => {
    const opening = form.getValues(`openings.${index}`);
    if (!opening.width || !opening.abjourType) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء توفير العرض ونوع الأباجور للحساب.',
      });
      return;
    }

    startDimTransition(async () => {
      const result = await calculateAbjourDimensions(null, {
        width: opening.width!,
        abjourType: opening.abjourType,
      });
      if (result.data) {
        form.setValue(`openings.${index}.codeLength`, result.data.codeLength);
        form.setValue(`openings.${index}.numberOfCodes`, result.data.numberOfCodes);
        toast({
          title: 'تم حساب الأبعاد!',
          description: 'تم تحديث طول الكود وعدد الأكواد.',
        });
      }
      if (result.error) {
        toast({ variant: 'destructive', title: 'خطأ', description: result.error });
      }
    });
  };

  const onSubmit = (data: OrderFormValues) => {
     startSubmitTransition(async () => {
        const result = await createOrderAction(data, isAdmin);
        if (result?.success) {
            toast({
                title: 'تم إرسال الطلب بنجاح!',
                description: `تم إنشاء طلبك "${data.orderName}".`,
            });
            form.reset();
        }
     });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAdmin ? 'معلومات المستخدم' : 'تفاصيل العميل'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {isAdmin ? (
                  <>
                    <div className="md:col-span-2">
                        <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>اختر مستخدمًا</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر مستخدمًا حاليًا أو أنشئ جديدًا" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="new">إنشاء مستخدم جديد</SelectItem>
                                {allUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    {watchUserId === 'new' && (
                      <>
                        <FormField
                          control={form.control}
                          name="newUserName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المستخدم الجديد</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: علي الأحمد" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="newUserEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>البريد الإلكتروني للمستخدم الجديد</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} placeholder="ali@example.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم العميل</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
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
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle>فتحات الطلب</CardTitle>
                    <CardDescription>
                      أضف فتحة واحدة أو أكثر لهذا الطلب.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      append({
                        serial: `A${fields.length + 1}`,
                        abjourType: 'قياسي',
                        color: 'أبيض',
                        codeLength: 0,
                        numberOfCodes: 0,
                        hasEndCap: false,
                        hasAccessories: false,
                        width: undefined,
                        height: undefined
                      })
                    }
                  >
                    <PlusCircle className="w-4 h-4 ml-2" /> إضافة فتحة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg relative space-y-4"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 w-6 h-6"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`openings.${index}.serial`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الرقم التسلسلي</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`openings.${index}.abjourType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع الأباجور</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {abjourTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
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
                        name={`openings.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اللون</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colors.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-4 items-end">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          الأبعاد اليدوية
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`openings.${index}.codeLength`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>طول الكود</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`openings.${index}.numberOfCodes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عدد الأكواد</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm font-medium">
                          حساب تلقائي باستخدام الذكاء الاصطناعي
                        </p>
                        <div className="grid grid-cols-2 gap-4 items-end">
                          <FormField
                            control={form.control}
                            name={`openings.${index}.width`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عرض الفتحة (سم)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} value={field.value ?? ''} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            onClick={() => handleCalculateDims(index)}
                            disabled={isDimPending}
                          >
                            {isDimPending ? (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="ml-2 h-4 w-4" />
                            )}
                            احسب
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <FormField
                        control={form.control}
                        name={`openings.${index}.hasEndCap`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row-reverse items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">إضافة غطاء طرفي</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`openings.${index}.hasAccessories`}
                        render={({ field }) => (
                           <FormItem className="flex flex-row-reverse items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">إضافة إكسسوارات</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                {form.formState.errors.openings && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.openings.message}
                    </p>
                  )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="orderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الطلب</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              {...field}
                              placeholder="مثال: 'غرفة معيشة الفيلا'"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={handleSuggestName}
                              disabled={isNamePending}
                            >
                              {isNamePending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">اقتراح اسم</span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المساحة الإجمالية</span>
                    <span className="font-medium">{totalArea.toFixed(2)} م²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التكلفة التقديرية</span>
                    <span className="font-medium">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitPending}
                >
                  {isSubmitPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  إرسال الطلب
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
