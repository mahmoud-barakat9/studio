'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';
import { Wand2, Loader2, Info } from 'lucide-react';
import {
  generateOrderName,
  createOrder as createOrderAction,
} from '@/lib/actions';
import React, { useActionState, useEffect, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User, Opening } from '@/lib/definitions';
import { abjourTypesData } from '@/lib/abjour-data';
import { AddOpeningForm } from './add-opening-form';
import { OpeningsTable } from './openings-table';

const openingSchema = z.object({
  serial: z.string(),
  abjourType: z.string().min(1, 'النوع مطلوب.'),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  codeLength: z.coerce.number().min(0.1, 'الطول مطلوب.'),
  numberOfCodes: z.coerce.number().int().min(1, 'عدد الأكواد مطلوب.'),
  hasEndCap: z.boolean().default(false),
  hasAccessories: z.boolean().default(false),
  notes: z.string().optional(),
});

const baseOrderSchema = z.object({
  orderName: z.string().min(1, 'اسم الطلب مطلوب.'),
  mainAbjourType: z.string({ required_error: "نوع الأباجور الرئيسي مطلوب."}).min(1, "نوع الأباجور الرئيسي مطلوب."),
  mainColor: z.string({ required_error: "اللون الرئيسي مطلوب."}).min(1, "اللون الرئيسي مطلوب."),
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
    newUserPhone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.userId === 'new') {
        return !!data.newUserName && !!data.newUserEmail && !!data.newUserPhone;
      }
      return !!data.userId && data.userId !== 'new';
    },
    {
      message: 'يجب اختيار مستخدم حالي أو إدخال تفاصيل مستخدم جديد كاملة (الاسم، البريد الإلكتروني، ورقم الهاتف).',
      path: ['userId'],
    }
  );


type OrderFormValues = z.infer<typeof userOrderSchema & typeof adminOrderSchema>;

export function OrderForm({ isAdmin = false, users: allUsers = [] }: { isAdmin?: boolean, users?: User[] }) {
  const orderSchema = isAdmin ? adminOrderSchema : userOrderSchema;
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: 'فاطمة الزهراء',
      customerPhone: '555-5678',
      orderName: '',
      mainAbjourType: '',
      mainColor: '',
      openings: [],
      userId: '',
      newUserName: '',
      newUserEmail: '',
      newUserPhone: '',
    },
  });

  const { toast } = useToast();

  const [nameState, generateNameAction] = useActionState(generateOrderName, null);
  const [isNamePending, startNameTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [currentDate, setCurrentDate] = useState('');

  const watchedOpenings = useWatch({ control: form.control, name: 'openings'});
  const watchMainAbjourType = useWatch({ control: form.control, name: 'mainAbjourType'});
  const watchUserId = useWatch({ control: form.control, name: 'userId'});

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));
  }, []);

  const selectedAbjourTypeData = abjourTypesData.find(t => t.name === watchMainAbjourType);
  const availableColors = selectedAbjourTypeData?.colors || [];

  const totalArea = watchedOpenings.reduce(
    (acc, op) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * (selectedAbjourTypeData?.bladeWidth || 0) / 100,
    0
  );
  const totalCost = totalArea * (selectedAbjourTypeData?.pricePerSquareMeter || 0);

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

  useEffect(() => {
    // Reset color if it's not available for the new type
    const currentColor = form.getValues('mainColor');
    if (selectedAbjourTypeData && !selectedAbjourTypeData.colors.includes(currentColor)) {
        form.setValue('mainColor', '');
    }
  }, [watchMainAbjourType, selectedAbjourTypeData, form]);

  const handleSuggestName = () => {
    const mainAbjourType = form.getValues('mainAbjourType');
    const mainColor = form.getValues('mainColor');
    const firstOpening = form.getValues('openings.0');

    if (!mainAbjourType || !mainColor || !firstOpening) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء اختيار نوع الأباجور واللون وإضافة فتحة واحدة على الأقل لإنشاء اسم.',
      });
      return;
    }
    startNameTransition(() => {
      generateNameAction({
          abjourType: mainAbjourType,
          color: mainColor,
          codeLength: firstOpening.codeLength,
          numberOfCodes: firstOpening.numberOfCodes,
      });
    });
  };

  const handleAddOpening = (openingData: Omit<Opening, 'serial'>) => {
    const newOpening = {
      ...openingData,
      serial: `OP${watchedOpenings.length + 1}`,
    };
    form.setValue('openings', [...watchedOpenings, newOpening]);
    toast({
        title: "تمت إضافة الفتحة",
        description: `الفتحة رقم ${watchedOpenings.length + 1} أضيفت إلى الجدول.`,
      })
  };

  const handleUpdateOpening = (index: number, updatedOpening: Opening) => {
    const newOpenings = [...watchedOpenings];
    newOpenings[index] = updatedOpening;
    form.setValue('openings', newOpenings);
  };

  const handleDeleteOpening = (index: number) => {
    const newOpenings = watchedOpenings.filter((_, i) => i !== index);
    form.setValue('openings', newOpenings);
  };


  const onSubmit = (data: OrderFormValues) => {
     startSubmitTransition(async () => {
        const payload = {
          ...data,
          bladeWidth: selectedAbjourTypeData?.bladeWidth,
          pricePerSquareMeter: selectedAbjourTypeData?.pricePerSquareMeter,
        };
        const result = await createOrderAction(payload, isAdmin);
        if (result?.success) {
            toast({
                title: 'تم إرسال الطلب بنجاح!',
                description: `تم إنشاء طلبك "${data.orderName}".`,
            });
            form.reset({
                openings: [],
                orderName: '',
                mainAbjourType: '',
                mainColor: '',
                customerName: isAdmin ? '' : 'فاطمة الزهراء',
                customerPhone: isAdmin ? '' : '555-5678',
                userId: '',
                newUserName: '',
                newUserEmail: '',
                newUserPhone: '',
            });
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
                <div className="flex items-center justify-between">
                    <CardTitle>
                    {isAdmin ? 'معلومات المستخدم' : 'تفاصيل العميل'}
                    </CardTitle>
                    {currentDate && (
                        <div className="text-sm text-muted-foreground">
                            تاريخ اليوم: <span className="font-medium text-foreground">{currentDate}</span>
                        </div>
                    )}
                </div>
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
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="newUserPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>رقم هاتف المستخدم الجديد</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., 555-123-4567" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
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
                <CardTitle>النوع الرئيسي للطلب</CardTitle>
                <CardDescription>اختر نوع ولون الأباجور الذي سيتم استخدامه في هذا الطلب.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mainAbjourType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الأباجور</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الأباجور" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {abjourTypesData.map(type => (
                              <SelectItem key={type.name} value={type.name}>
                                {type.name}
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
                    name="mainColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اللون الرئيسي</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchMainAbjourType}>
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
                </div>
                {selectedAbjourTypeData && (
                  <div className='grid md:grid-cols-2 gap-4 pt-2'>
                      <FormItem>
                          <FormLabel>عرض الشفرة</FormLabel>
                          <Input readOnly value={`${selectedAbjourTypeData.bladeWidth} سم`} />
                           <FormDescription className='flex items-center gap-1'>
                             <Info className='w-3 h-3' />
                             هذه القيمة ثابتة لهذا النوع
                           </FormDescription>
                      </FormItem>
                       <FormItem>
                          <FormLabel>سعر المتر المربع</FormLabel>
                          <Input readOnly value={`$${selectedAbjourTypeData.pricePerSquareMeter.toFixed(2)}`} />
                          <FormDescription className='flex items-center gap-1'>
                             <Info className='w-3 h-3' />
                             يتم استخدامه لحساب التكلفة الإجمالية
                           </FormDescription>
                      </FormItem>
                  </div>
                )}
              </CardContent>
            </Card>

            <AddOpeningForm 
                onAddOpening={handleAddOpening} 
                bladeWidth={selectedAbjourTypeData?.bladeWidth || 0}
                isDisabled={!watchMainAbjourType || !form.getValues('mainColor')}
            />

            {watchedOpenings.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>الفتحات المضافة</CardTitle>
                        <CardDescription>
                            هنا قائمة بجميع الفتحات التي أضفتها إلى هذا الطلب.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <OpeningsTable 
                          openings={watchedOpenings}
                          onUpdateOpening={handleUpdateOpening}
                          onDeleteOpening={handleDeleteOpening}
                       />
                       {form.formState.errors.openings && (
                        <p className="text-sm font-medium text-destructive mt-2">
                          {form.formState.errors.openings.message || form.formState.errors.openings.root?.message}
                        </p>
                      )}
                    </CardContent>
                </Card>
            )}
            
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
                    <span className="text-muted-foreground">إجمالي عدد الفتحات</span>
                    <span className="font-medium">{watchedOpenings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المساحة الإجمالية</span>
                    <span className="font-medium">{totalArea.toFixed(2)} م²</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base">
                    <span className="text-muted-foreground">التكلفة الإجمالية</span>
                    <span className="font-bold">${totalCost.toFixed(2)}</span>
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
