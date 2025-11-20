
'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Wand2, Loader2, Info } from 'lucide-react';
import {
  calculateAbjourDimensions,
  updateOrder,
} from '@/lib/actions';
import React, { useEffect, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User, Order } from '@/lib/definitions';
import { abjourTypesData } from '@/lib/abjour-data';

const openingSchema = z.object({
  serial: z.string(), // This will be managed internally now
  abjourType: z.string().min(1, 'النوع مطلوب.'),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  codeLength: z.coerce.number().min(0.1, 'الطول مطلوب.'),
  numberOfCodes: z.coerce.number().int().min(1, 'عدد الأكواد مطلوب.'),
  hasEndCap: z.boolean().default(false),
  hasAccessories: z.boolean().default(false),
});

const orderSchema = z.object({
  orderName: z.string().min(1, 'اسم الطلب مطلوب.'),
  mainAbjourType: z.string({ required_error: "نوع الأباجور الرئيسي مطلوب."}).min(1, "نوع الأباجور الرئيسي مطلوب."),
  mainColor: z.string({ required_error: "اللون الرئيسي مطلوب."}).min(1, "اللون الرئيسي مطلوب."),
  status: z.string().min(1, "الحالة مطلوبة"),
  openings: z.array(openingSchema).min(1, 'يجب إضافة فتحة واحدة على الأقل.'),
  userId: z.string(), // Keep userId for context
});

type OrderFormValues = z.infer<typeof orderSchema>;

const openingAbjourTypes = ['قياسي', 'ضيق', 'عريض'];
const statuses: Order['status'][] = ["Pending", "FactoryOrdered", "Processing", "FactoryShipped", "ReadyForDelivery", "Delivered", "Rejected"];

const statusTranslations: Record<Order['status'], string> = {
  "Pending": "تم الاستلام",
  "FactoryOrdered": "تم الطلب من المعمل",
  "Processing": "قيد التجهيز",
  "FactoryShipped": "تم الشحن من المعمل",
  "ReadyForDelivery": "جاهز للتسليم",
  "Delivered": "تم التوصيل",
  "Rejected": "مرفوض",
};


export function EditOrderForm({ order, users }: { order: Order, users: User[] }) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      ...order,
      openings: order.openings.map(o => ({...o, width: o.width || undefined, height: o.height || undefined }))
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'openings',
  });

  const { toast } = useToast();

  const [isDimPending, startDimTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();

  const watchedOpenings = form.watch('openings');
  const watchMainAbjourType = form.watch('mainAbjourType');

  const selectedAbjourTypeData = abjourTypesData.find(t => t.name === watchMainAbjourType);
  const availableColors = selectedAbjourTypeData?.colors || [];
  
  const totalArea = watchedOpenings.reduce(
    (acc, op) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * (selectedAbjourTypeData?.bladeWidth || 0) / 100,
    0
  );
  const totalCost = totalArea * (selectedAbjourTypeData?.pricePerSquareMeter || 0);

  useEffect(() => {
    // Reset color if it's not available for the new type
    const currentColor = form.getValues('mainColor');
    if (selectedAbjourTypeData && !selectedAbjourTypeData.colors.includes(currentColor)) {
        form.setValue('mainColor', '');
    }
  }, [watchMainAbjourType, selectedAbjourTypeData, form]);

  const handleCalculateDims = (index: number) => {
    const opening = form.getValues(`openings.${index}`);
    if (!opening.width || !opening.abjourType) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء توفير العرض ونوع التركيب للحساب.',
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
        const payload = {
          ...data,
          bladeWidth: selectedAbjourTypeData?.bladeWidth,
          pricePerSquareMeter: selectedAbjourTypeData?.pricePerSquareMeter,
        };
        const result = await updateOrder(order.id, payload, true);
        if (result?.success) {
            toast({
                title: 'تم تحديث الطلب بنجاح!',
                description: `تم حفظ التغييرات على طلب "${data.orderName}".`,
            });
        }
     });
  };
  
  const customer = users.find(u => u.id === order.userId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>
                    معلومات المستخدم
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <FormLabel>اسم العميل</FormLabel>
                      <p className="text-sm text-muted-foreground">{customer?.name}</p>
                  </div>
                   <div className="space-y-1">
                      <FormLabel>البريد الإلكتروني للعميل</FormLabel>
                      <p className="text-sm text-muted-foreground">{customer?.email}</p>
                  </div>
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

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                   <div>
                    <CardTitle>فتحات الطلب</CardTitle>
                    <CardDescription>
                      أضف أو عدّل الفتحات الخاصة بهذا الطلب.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      append({
                        serial: `OP${fields.length + 1}`,
                        abjourType: 'قياسي',
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
                     <div className="absolute top-2 right-2 font-bold text-lg text-muted-foreground">
                        {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 w-6 h-6"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      
                      <FormField
                        control={form.control}
                        name={`openings.${index}.abjourType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع التركيب</FormLabel>
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
                                {openingAbjourTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>نوع التركيب وليس نوع الأباجور</FormDescription>
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
                                <FormLabel>طول الكود (م)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="orderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الطلب</FormLabel>
                      <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: 'غرفة معيشة الفيلا'"
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>حالة الطلب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Separator />
                <div className="space-y-2 text-sm">
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
                  disabled={isSubmitPending || form.formState.isSubmitting}
                >
                  {(isSubmitPending || form.formState.isSubmitting) && (
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
