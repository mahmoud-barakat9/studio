

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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Wand2, Loader2, Info, Truck, BadgeDollarSign } from 'lucide-react';
import {
  generateOrderName,
  createOrder as createOrderAction,
} from '@/lib/actions';
import React, { useActionState, useEffect, useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User, Opening, Order } from '@/lib/definitions';
import { abjourTypesData } from '@/lib/abjour-data';
import { AddOpeningForm } from './add-opening-form';
import { OpeningsTable } from './openings-table';
import { Skeleton } from '../ui/skeleton';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useMediaQuery } from '@/hooks/use-media-query';


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
  isAdmin?: boolean;
  users?: User[];
  currentUser?: User | null;
  currentDate?: React.ReactNode;
}

function FloatingSubmitButton({ isVisible, isPending, totalCost, onClick }: { isVisible: boolean, isPending: boolean, totalCost: number, onClick: () => void }) {
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 lg:hidden">
            <div className="bg-background/95 backdrop-blur-sm p-4 border-t border-border shadow-lg">
                <div className="flex items-center justify-between gap-4">
                     <div>
                        <span className="text-sm text-muted-foreground">التكلفة الإجمالية</span>
                        <p className="font-bold text-lg">${totalCost.toFixed(2)}</p>
                    </div>
                    <Button
                        type="button"
                        onClick={onClick}
                        disabled={isPending}
                        size="lg"
                        className="w-full max-w-xs"
                    >
                        {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        إرسال الطلب
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function OrderForm({ isAdmin = false, users: allUsers = [], currentUser, currentDate }: OrderFormProps) {
  const orderSchema = isAdmin ? adminOrderSchema : userOrderSchema;
  const router = useRouter();
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderName: '',
      mainAbjourType: '',
      mainColor: '',
      openings: [],
      hasDelivery: false,
      deliveryAddress: '',
      userId: currentUser?.id || '',
      customerName: currentUser?.name || '',
      customerPhone: currentUser?.phone || '',
      newUserName: '',
      newUserEmail: '',
      newUserPhone: '',
      overriddenPricePerSquareMeter: undefined,
    },
  });

  const { toast } = useToast();

  const [nameState, generateNameAction] = useActionState(generateOrderName, null);
  const [isNamePending, startNameTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");


  useEffect(() => {
    if (isDesktop) {
        setShowFloatingButton(false);
        return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            setShowFloatingButton(!entry.isIntersecting);
        },
        { root: null, rootMargin: "0px", threshold: 0 }
    );

    const currentRef = submitButtonRef.current;
    if (currentRef) {
        observer.observe(currentRef);
    }

    return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, [isDesktop]);

  const watchedOpenings = useWatch({ control: form.control, name: 'openings'});
  const watchMainAbjourType = useWatch({ control: form.control, name: 'mainAbjourType'});
  const watchMainColor = useWatch({ control: form.control, name: 'mainColor' });
  const watchUserId = useWatch({ control: form.control, name: 'userId'});
  const watchHasDelivery = useWatch({ control: form.control, name: 'hasDelivery' });
  const watchOverriddenPrice = useWatch({ control: form.control, name: 'overriddenPricePerSquareMeter' });


  useEffect(() => {
     if (!isAdmin && currentUser) {
        form.reset({
            ...form.getValues(),
            userId: currentUser.id,
            customerName: currentUser.name,
            customerPhone: currentUser.phone || '',
        });
    }
  }, [isAdmin, currentUser, form]);

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
  };

  const handleUpdateOpening = (index: number, updatedOpeningData: Omit<Opening, 'serial'>) => {
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
        };
        
        const result = await createOrderAction(payload, isAdmin);
        if (result?.success && result.orderId) {
            toast({
                title: 'تم إرسال الطلب بنجاح!',
                description: `تم إنشاء طلبك "${payload.orderName}".`,
            });
            
            if (!isAdmin) {
                router.push(`/orders/${result.orderId}`);
            }
        } else if (!isAdmin && result?.success) {
            // Admin redirection is handled by server-side redirect()
             toast({
                title: 'تم إرسال الطلب بنجاح!',
                description: `تم إنشاء طلبك "${payload.orderName}".`,
            });
            form.reset({
                openings: [],
                orderName: '',
                mainAbjourType: '',
                mainColor: '',
                hasDelivery: false,
                deliveryAddress: '',
                userId: isAdmin ? '' : currentUser?.id,
                customerName: isAdmin ? '' : currentUser?.name,
                customerPhone: isAdmin ? '' : currentUser?.phone,
                newUserName: '',
                newUserEmail: '',
                newUserPhone: '',
                overriddenPricePerSquareMeter: undefined,
            });
        }
     });
  };

  const isPrimaryInfoSelected = !!watchMainAbjourType && !!watchMainColor;

  const addOpeningButton = (
    <AddOpeningForm
      onSave={handleAddOpening}
      bladeWidth={selectedAbjourTypeData?.bladeWidth || 0}
      isDisabled={!isPrimaryInfoSelected}
      openingsCount={watchedOpenings.length}
      variant={watchedOpenings.length > 0 ? 'secondary' : 'default'}
    />
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
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
                ) : !currentUser ? (
                  <>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
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
                            <Input {...field} readOnly />
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
                      <div className='flex items-center gap-3'>
                          <CardTitle>فتحات الطلب</CardTitle>
                           {watchedOpenings.length > 0 && <Badge variant="secondary">{watchedOpenings.length}</Badge>}
                      </div>
                      <CardDescription>
                          أضف الفتحات الخاصة بهذا الطلب. يجب تحديد النوع واللون أولاً.
                      </CardDescription>
                  </CardHeader>
                  {watchedOpenings.length === 0 && (
                      <CardContent>
                          <div className="text-center py-6 px-4 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                               {isPrimaryInfoSelected ? "أنت جاهز الآن!" : "خطوة أولى"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {isPrimaryInfoSelected 
                                    ? "انقر أدناه لإضافة أول فتحة لطلبك." 
                                    : "الرجاء اختيار نوع الأباجور واللون الرئيسي أولاً."}
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
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </CardContent>
                    )}
                </Card>
                 <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي عدد الفتحات</span>
                    <span className="font-medium">{watchedOpenings.length}</span>
                  </div>
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
                  ref={submitButtonRef}
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
         <FloatingSubmitButton 
            isVisible={showFloatingButton} 
            isPending={isSubmitPending}
            totalCost={totalCost}
            onClick={() => form.handleSubmit(onSubmit)()}
        />
        <div className="lg:hidden h-24" /> {/* Spacer for floating button */}
      </form>
    </Form>
  );
}
