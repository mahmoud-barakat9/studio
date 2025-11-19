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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PlusCircle } from 'lucide-react';
import type { Opening } from '@/lib/definitions';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

const openingSchema = z.object({
    method: z.enum(['direct', 'measure']),
    width: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    codeLength: z.coerce.number().optional(),
    numberOfCodes: z.coerce.number().optional(),
    hasEndCap: z.boolean().default(false),
    hasAccessories: z.boolean().default(false),
    notes: z.string().optional(),
}).refine(data => {
    if (data.method === 'direct') {
        return data.codeLength && data.codeLength > 0 && data.numberOfCodes && data.numberOfCodes > 0;
    }
    if (data.method === 'measure') {
        return data.width && data.width > 0 && data.height && data.height > 0;
    }
    return false;
}, {
    message: 'الرجاء إدخال البيانات المطلوبة لطريقة الإدخال المحددة.',
    path: ['method'],
});


type OpeningFormValues = z.infer<typeof openingSchema>;

interface AddOpeningFormProps {
    onAddOpening: (opening: Omit<Opening, 'serial'>) => void;
    bladeWidth: number;
    isDisabled: boolean;
}

export function AddOpeningForm({ onAddOpening, bladeWidth, isDisabled }: AddOpeningFormProps) {
    const form = useForm<OpeningFormValues>({
        resolver: zodResolver(openingSchema),
        defaultValues: {
            method: 'direct',
            hasEndCap: false,
            hasAccessories: false,
        },
    });

    const watchMethod = useWatch({ control: form.control, name: 'method'});
    const watchWidth = useWatch({ control: form.control, name: 'width'});
    const watchHeight = useWatch({ control: form.control, name: 'height'});
    const watchHasAccessories = useWatch({ control: form.control, name: 'hasAccessories' });
    
    // --- Calculations for 'measure' method ---
    const finalWidth = (watchWidth || 0) - 3.5;
    const finalHeight = (watchHeight || 0) + 10;
    const calculatedCodeLength = finalWidth > 0 ? finalWidth : 0;
    const calculatedNumberOfCodes = (bladeWidth > 0 && finalHeight > 0) ? Math.ceil(finalHeight / bladeWidth) : 0;
    const channelLength = (watchHeight || 0) > 0 ? ((watchHeight || 0) + 5) * 2 : 0;

    const onSubmit = (data: OpeningFormValues) => {
        let finalOpeningData: Omit<Opening, 'serial' | 'abjourType'>;

        if (data.method === 'measure' && calculatedCodeLength > 0 && calculatedNumberOfCodes > 0) {
            finalOpeningData = {
                width: data.width,
                height: data.height,
                codeLength: calculatedCodeLength / 100, // Convert cm to m
                numberOfCodes: calculatedNumberOfCodes,
                hasEndCap: data.hasEndCap,
                hasAccessories: data.hasAccessories,
                notes: data.notes,
            };
        } else { // direct method
            finalOpeningData = {
                codeLength: data.codeLength!,
                numberOfCodes: data.numberOfCodes!,
                hasEndCap: data.hasEndCap,
                hasAccessories: data.hasAccessories,
                notes: data.notes,
            };
        }
        
        onAddOpening({ ...finalOpeningData, abjourType: 'قياسي' }); // abjourType is hardcoded for now
        form.reset({
            method: 'direct',
            width: undefined,
            height: undefined,
            codeLength: undefined,
            numberOfCodes: undefined,
            hasEndCap: false,
            hasAccessories: false,
            notes: '',
        });
    };

    if (isDisabled) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>إضافة فتحة جديدة</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        يجب اختيار نوع الأباجور واللون الرئيسيين أولاً قبل إضافة الفتحات.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>إضافة فتحة جديدة</CardTitle>
                        <CardDescription>
                            أضف الفتحات واحدة تلو الأخرى. ستظهر في جدول بالأسفل.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Input Method */}
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>الخطوة 1: اختر طريقة الإدخال</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="direct" id="direct" className="sr-only" />
                                                </FormControl>
                                                <FormLabel htmlFor="direct" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${field.value === 'direct' ? 'border-primary' : ''}`}>
                                                    طريقة مباشرة
                                                    <span className="text-xs text-muted-foreground mt-1">طول الشفرة + عدد الشفرات</span>
                                                </FormLabel>
                                            </FormItem>
                                             <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="measure" id="measure" className="sr-only"/>
                                                </FormControl>
                                                <FormLabel htmlFor="measure" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${field.value === 'measure' ? 'border-primary' : ''}`}>
                                                    طريقة القياس
                                                     <span className="text-xs text-muted-foreground mt-1">عرض × ارتفاع الفتحة</span>
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Step 2: Input Fields */}
                         <div>
                            <FormLabel>الخطوة 2: أدخل الأبعاد</FormLabel>
                             <div className="p-4 border rounded-lg mt-2">
                                {watchMethod === 'direct' ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="codeLength"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>طول الشفرة (م)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="numberOfCodes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>عدد الشفرات</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                         <div className="grid md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="width"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>عرض الفتحة (سم)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} value={field.value ?? ''} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name="height"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>ارتفاع الفتحة (سم)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} value={field.value ?? ''} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        {(watchWidth || 0) > 0 && (watchHeight || 0) > 0 && bladeWidth > 0 && (
                                            <div className="p-3 bg-muted/50 rounded-md text-sm space-y-2">
                                                <h4 className="font-semibold text-center">الحسابات التلقائية</h4>
                                                <div className="flex justify-between"><span>العرض النهائي:</span> <span className="font-mono">{(finalWidth / 100).toFixed(2)} م</span></div>
                                                <div className="flex justify-between"><span>الارتفاع النهائي:</span> <span className="font-mono">{(finalHeight / 100).toFixed(2)} م</span></div>
                                                <div className="flex justify-between font-bold text-primary"><span>طول الشفرة المحسوب:</span> <span className="font-mono">{(calculatedCodeLength / 100).toFixed(2)} م</span></div>
                                                <div className="flex justify-between font-bold text-primary"><span>عدد الشفرات المحسوب:</span> <span className="font-mono">{calculatedNumberOfCodes}</span></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Additional Options */}
                         <div>
                            <FormLabel>الخطوة 3: خيارات إضافية</FormLabel>
                             <div className="p-4 border rounded-lg mt-2 space-y-4">
                               <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                    <FormField
                                        control={form.control}
                                        name="hasEndCap"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row-reverse items-center gap-2 space-y-0">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <FormLabel className="!mt-0">إضافة نهاية</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hasAccessories"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row-reverse items-center gap-2 space-y-0">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <FormLabel className="!mt-0">إضافة مجاري</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                               </div>
                                {watchHasAccessories && watchMethod === 'measure' && channelLength > 0 && (
                                     <div className="p-3 bg-muted/50 rounded-md text-sm space-y-2">
                                        <div className="flex justify-between font-bold"><span>طول المجرى المحسوب:</span> <span className="font-mono">{(channelLength / 100).toFixed(2)} م</span></div>
                                    </div>
                                )}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ملاحظات (اختياري)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="أضف أي ملاحظات خاصة لهذه الفتحة..." {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full">
                            <PlusCircle className="w-4 h-4 ml-2" /> إضافة الفتحة
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
