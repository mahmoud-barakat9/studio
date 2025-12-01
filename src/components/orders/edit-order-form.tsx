

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from '@/components/ui/separator';
import { Loader2, Info, CalendarIcon, BadgeDollarSign, Truck } from 'lucide-react';
import { format } from "date-fns"
import {
  updateOrder,
} from '@/lib/actions';
import React, { useEffect, useTransition, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User, Order, Opening } from '@/lib/definitions';
import { abjourTypesData } from '@/lib/abjour-data';
import { AddOpeningForm } from './add-opening-form';
import { OpeningsTable } from './openings-table';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
  orderName: z.string().optional(),
  mainAbjourType: z.string({ required_error: "نوع الأباجور الرئيسي مطلوب."}).min(1, "نوع الأباجور الرئيسي مطلوب."),
  mainColor: z.string({ required_error: "اللون الرئيسي مطلوب."}).min(1, "اللون الرئيسي مطلوب."),
  openings: z.array(openingSchema).min(1, 'يجب إضافة فتحة واحدة على الأقل.'),
  hasDelivery: z.boolean().default(false),
  deliveryAddress: z.string().optional(),
  scheduledDeliveryDate: z.string().optional(),
  overriddenPricePerSquareMeter: z.coerce.number().optional(),
});

const userOrderSchema = baseOrderSchema.extend({
  userId: z.string().min(1, "معرف المستخدم مطلوب."),
  customerName: z.string().min(1, 'اسم العميل مطلوب.'),
  customerPhone: z.string().min(1, 'رقم الهاتف مطلوب.'),
}).refine(data => !data.hasDelivery || (data.hasDelivery && data.deliveryAddress && data.deliveryAddress.length > 0), {
    message: 'عنوان التوصيل مطلوب عند تفعيل خيار التوصيل.',
    path: ['deliveryAddress'],
});

const adminOrderSchema = baseOrderSchema.extend({
    userId: z.string().optional(),
    newUserName: z.string().optional(),
    newUserEmail: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal('')),
    newUserPhone: z.string().optional(),
    status: z.nativeEnum(z.enum(["Pending", "Approved", "FactoryOrdered", "Processing", "FactoryShipped", "ReadyForDelivery", "Delivered", "Rejected"])),
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
  ).refine(data => !data.hasDelivery || (data.hasDelivery && data.deliveryAddress && data.deliveryAddress.length > 0), {
    message: 'عنوان التوصيل مطلوب عند تفعيل خيار التوصيل.',
    path: ['deliveryAddress'],
});



type OrderFormValues = z.infer<typeof userOrderSchema & typeof adminOrderSchema>;

interface OrderFormProps {
  order: Order,
  isAdmin?: boolean;
  users?: User[];
}

const statuses: Order['status'][] = ["Pending", "Approved", "FactoryOrdered", "Processing", "FactoryShipped", "ReadyForDelivery", "Delivered", "Rejected"];
const statusTranslations: Record<Order['status'], string> = {
  "Pending": "بانتظار الموافقة",
  "Approved": "جاهزة للإرسال للمعمل",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};


export function EditOrderForm({ order, isAdmin = false, users = [] }: OrderFormProps) {
    const orderSchema = isAdmin ? adminOrderSchema : userOrderSchema;

    const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      ...order,
      overriddenPricePerSquareMeter: order.overriddenPricePerSquareMeter || undefined,
      scheduledDeliveryDate: order.scheduledDeliveryDate || undefined,
      openings: order.openings.map(o => ({...o, width: o.width || undefined, height: o.height || undefined, notes: o.notes || '' }))
    },
  });

  const { toast } = useToast();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  
  const watchedOpenings = useWatch({ control: form.control, name: 'openings'});
  const watchMainAbjourType = useWatch({ control: form.control, name: 'mainAbjourType'});
  const watchHasDelivery = useWatch({ control: form.control, name: 'hasDelivery' });
  const watchOverriddenPrice = useWatch({ control: form.control, name: 'overriddenPricePerSquareMeter' });


  const selectedAbjourTypeData = useMemo(() => {
    return abjourTypesData.find(t => t.name === watchMainAbjourType);
  }, [watchMainAbjourType]);

  const availableColors = useMemo(() => {
    return selectedAbjourTypeData?.colors || [];
  }, [selectedAbjourTypeData]);

  const totalArea = useMemo(() => {
    return watchedOpenings.reduce(
      (acc, op) => acc + ((op.codeLength || 0) * (op.numberOfCodes || 0) * (selectedAbjourTypeData?.bladeWidth || 0)) / 10000,
      0
    );
  }, [watchedOpenings, selectedAbjourTypeData]);

  const finalPricePerMeter = watchOverriddenPrice || selectedAbjourTypeData?.pricePerSquareMeter || 0;
  
  const productsCost = useMemo(() => {
    return totalArea * finalPricePerMeter;
  }, [totalArea, finalPricePerMeter]);
  
  const deliveryCost = useMemo(() => {
    return watchHasDelivery ? (5 + (totalArea * 0.5)) : 0;
  }, [watchHasDelivery, totalArea]);

  const totalCost = productsCost + deliveryCost;


  useEffect(() => {
    const currentColor = form.getValues('mainColor');
    if (selectedAbjourTypeData && !selectedAbjourTypeData.colors.includes(currentColor)) {
        form.setValue('mainColor', '');
    }
  }, [watchMainAbjourType, selectedAbjourTypeData, form]);

  const handleAddOpening = (openingData: Omit<Order['openings'][0], 'serial'>) => {
    const newOpening = {
      ...openingData,
      serial: `OP${watchedOpenings.length + 1}`,
    };
    form.setValue('openings', [...watchedOpenings, newOpening]);
  };

  const handleUpdateOpening = (index: number, updatedOpeningData: Omit<Order['openings'][0], 'serial'>) => {
    const newOpenings = [...watchedOpenings];
    newOpenings[index] = { ...newOpenings[index], ...updatedOpeningData };
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
          orderName: data.orderName || `طلب ${new Date().toLocaleString()}`,
          bladeWidth: selectedAbjourTypeData?.bladeWidth,
          pricePerSquareMeter: selectedAbjourTypeData?.pricePerSquareMeter,
          overriddenPricePerSquareMeter: data.overriddenPricePerSquareMeter,
          scheduledDeliveryDate: data.scheduledDeliveryDate,
        };
        
        const result = await updateOrder(order.id, payload, isAdmin);
        if (result?.success) {
            toast({
                title: 'تم تحديث الطلب بنجاح!',
                description: `تم حفظ التغييرات على طلب "${payload.orderName}".`,
            });
        }
     });
  };

  const isPrimaryInfoSelected = !!watchMainAbjourType && !!form.watch('mainColor');

  const addOpeningButton = (
    <AddOpeningForm
      onSave={handleAddOpening}
      bladeWidth={selectedAbjourTypeData?.bladeWidth || 0}
      isDisabled={!isPrimaryInfoSelected}
      openingsCount={watchedOpenings.length}
      variant={watchedOpenings.length > 0 ? 'secondary' : 'default'}
    />
  );
  
  const customer = users.find(u => u.id === order.userId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>
                      الإعدادات الإدارية للطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>حالة الطلب</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر حالة الطلب" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                    {statusTranslations[status]}
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
                      name="scheduledDeliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>تاريخ التسليم المجدول</FormLabel>
                           <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="ml-2 h-4 w-4" />
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>اختر تاريخًا</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>
            )}

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
                          <FormLabel>سعر المتر المربع الافتراضي</FormLabel>
                          <Input readOnly value={`$${selectedAbjourTypeData.pricePerSquareMeter.toFixed(2)}`} />
                          <FormDescription className='flex items-center gap-1'>
                             <Info className='w-3 h-3' />
                             يتم استخدامه لحساب التكلفة الإجمالية
                           </FormDescription>
                      </FormItem>
                  </div>
                )}
                 {isAdmin && selectedAbjourTypeData && (
                    <div className="pt-4">
                         <FormField
                            control={form.control}
                            name="overriddenPricePerSquareMeter"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-2"><BadgeDollarSign /> تعديل سعر المتر المربع (اختياري)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder={`الافتراضي: $${selectedAbjourTypeData.pricePerSquareMeter.toFixed(2)}`}
                                    />
                                </FormControl>
                                <FormDescription>اتركه فارغًا لاستخدام السعر الافتراضي.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
               <Card>
                  <CardHeader>
                      <CardTitle>فتحات الطلب</CardTitle>
                      <CardDescription>
                          أضف أو عدّل الفتحات الخاصة بهذا الطلب.
                      </CardDescription>
                  </CardHeader>
                  {watchedOpenings.length === 0 && (
                      <CardContent>
                          <div className="text-center py-6 px-4 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد فتحات</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                انقر أدناه لإضافة أول فتحة لطلبك.
                            </p>
                            {addOpeningButton}
                         </div>
                      </CardContent>
                  )}
              </Card>

               {form.formState.errors.openings && (
                  <p className="text-sm font-medium text-destructive px-4">
                  {form.formState.errors.openings.message || form.formState.errors.openings.root?.message}
                  </p>
              )}

              {watchedOpenings.length > 0 && (
                  <div className="space-y-4">
                      <OpeningsTable 
                          openings={watchedOpenings}
                          bladeWidth={selectedAbjourTypeData?.bladeWidth || 0}
                          onUpdateOpening={handleUpdateOpening}
                          onDeleteOpening={handleDeleteOpening}
                      />
                       <div className="flex justify-center pt-2">
                           {addOpeningButton}
                       </div>
                  </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 lg:sticky top-4 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="orderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الطلب</FormLabel>
                      <FormControl>
                          <Input
                            {...field}
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {isAdmin && customer && (
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">اسم العميل</span>
                            <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">البريد الإلكتروني</span>
                            <span className="font-medium">{customer.email}</span>
                        </div>
                    </div>
                 )}
                 <Card className="shadow-none">
                    <CardHeader className="p-4">
                        <FormField
                        control={form.control}
                        name="hasDelivery"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base flex items-center gap-2">
                                    <Truck className="h-5 w-5"/>
                                    إضافة خدمة توصيل
                                    </FormLabel>
                                    <FormDescription>
                                    تفعيل هذا الخيار سيضيف تكلفة التوصيل.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    </CardHeader>
                    {watchHasDelivery && (
                    <CardContent className="p-4 pt-0">
                         <FormField
                            control={form.control}
                            name="deliveryAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>عنوان التوصيل</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="الرجاء إدخال عنوان التوصيل الكامل هنا..."
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </CardContent>
                    )}
                </Card>
                 <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المساحة الإجمالية</span>
                    <span className="font-medium">{totalArea.toFixed(2)} م²</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تكلفة المنتجات</span>
                    <div className="flex items-center gap-2">
                         {watchOverriddenPrice ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="secondary">مُعدل</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>السعر الافتراضي: ${selectedAbjourTypeData?.pricePerSquareMeter.toFixed(2)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : null}
                        <span className="font-medium">${productsCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={`flex justify-between transition-opacity ${watchHasDelivery ? 'opacity-100' : 'opacity-50'}`}>
                    <span className="text-muted-foreground">تكلفة التوصيل</span>
                    <span className="font-medium">${deliveryCost.toFixed(2)}</span>
                  </div>
                  <Separator />
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
                  حفظ التغييرات
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
