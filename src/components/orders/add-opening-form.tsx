
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Pencil } from 'lucide-react';
import type { Opening } from '@/lib/definitions';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

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
    onSave: (opening: Omit<Opening, 'serial'>) => void;
    bladeWidth: number;
    isDisabled: boolean;
    openingsCount: number;
    openingToEdit?: Opening | null;
    isEditing?: boolean;
}

export function AddOpeningForm({ onSave, bladeWidth, isDisabled, openingsCount, openingToEdit, isEditing = false }: AddOpeningFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm<OpeningFormValues>({
        resolver: zodResolver(openingSchema),
        defaultValues: {
            method: 'direct',
            hasEndCap: false,
            hasAccessories: false,
        },
    });

    useEffect(() => {
        if (isOpen) {
            const defaultValues = {
                method: 'direct' as 'direct' | 'measure',
                width: undefined,
                height: undefined,
                codeLength: undefined,
                numberOfCodes: undefined,
                hasEndCap: false,
                hasAccessories: false,
                notes: '',
            };

            if (isEditing && openingToEdit) {
                const isMeasureMethod = openingToEdit.width && openingToEdit.height;
                defaultValues.method = isMeasureMethod ? 'measure' : 'direct';
                defaultValues.width = openingToEdit.width;
                defaultValues.height = openingToEdit.height;
                // Don't set codeLength/numberOfCodes if it was a measure-based opening initially
                if (!isMeasureMethod) {
                    defaultValues.codeLength = openingToEdit.codeLength;
                    defaultValues.numberOfCodes = openingToEdit.numberOfCodes;
                }
                defaultValues.hasEndCap = openingToEdit.hasEndCap;
                defaultValues.hasAccessories = openingToEdit.hasAccessories;
                defaultValues.notes = openingToEdit.notes;
            }
            form.reset(defaultValues);
        }
    }, [isOpen, isEditing, openingToEdit, form]);


    const watchMethod = useWatch({ control: form.control, name: 'method'});
    const watchWidth = useWatch({ control: form.control, name: 'width'});
    const watchHeight = useWatch({ control: form.control, name: 'height'});
    const watchHasAccessories = useWatch({ control: form.control, name: 'hasAccessories' });
    
    // --- Calculations for 'measure' method ---
    const finalWidth = (watchWidth || 0) - 3.5;
    const calculatedCodeLength = finalWidth > 0 ? finalWidth : 0;
    
    const finalHeight = (watchHeight || 0) + 10;
    const calculatedNumberOfCodes = (bladeWidth > 0 && finalHeight > 0) ? Math.ceil(finalHeight / bladeWidth) : 0;
    
    const channelLength = (watchHeight || 0) > 0 ? ((watchHeight || 0) + 5) * 2 : 0;

     useEffect(() => {
        if (watchMethod === 'measure') {
            form.setValue('codeLength', calculatedCodeLength > 0 ? parseFloat(calculatedCodeLength.toFixed(2)) : undefined);
            form.setValue('numberOfCodes', calculatedNumberOfCodes > 0 ? calculatedNumberOfCodes : undefined);
        } else {
             if (!isEditing || !(openingToEdit?.width && openingToEdit?.height)) {
                form.setValue('codeLength', form.getValues('codeLength') || undefined);
                form.setValue('numberOfCodes', form.getValues('numberOfCodes') || undefined);
             }
        }
    }, [watchMethod, calculatedCodeLength, calculatedNumberOfCodes, form, isEditing, openingToEdit]);


    const resetForm = () => {
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
    }

    const processSubmit = (data: OpeningFormValues) => {
        let finalOpeningData: Omit<Opening, 'serial' | 'abjourType'>;

        if (data.method === 'measure' && calculatedCodeLength > 0 && calculatedNumberOfCodes > 0) {
            finalOpeningData = {
                width: data.width,
                height: data.height,
                codeLength: calculatedCodeLength,
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
        
        onSave({ ...finalOpeningData, abjourType: 'قياسي' }); // abjourType is hardcoded for now
        toast({
            title: isEditing ? `تم تحديث الفتحة` : `تمت إضافة الفتحة #${openingsCount + 1}`,
            description: "تم حفظ التغييرات بنجاح.",
        });
    };

    const handleSaveAndContinue = () => {
        form.handleSubmit(data => {
            if (isEditing) {
                 toast({
                    variant: "destructive",
                    title: "غير مسموح",
                    description: "لا يمكن استخدام 'إضافة والمتابعة' في وضع التعديل.",
                });
                return;
            }
            processSubmit(data);
            resetForm();
        })();
    }
    
    const handleSaveAndClose = () => {
        form.handleSubmit(data => {
            processSubmit(data);
            setIsOpen(false);
            resetForm();
        })();
    }


    const triggerButton = isEditing ? (
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setIsOpen(true)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">تعديل</span>
        </Button>
    ) : (
         <Button type="button" variant="outline" disabled={isDisabled}>
            <PlusCircle className="w-4 h-4 ml-2" />
            أضف فتحة جديدة
        </Button>
    );

    const dialogTrigger = isDisabled ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span tabIndex={0}>{triggerButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>الرجاء اختيار نوع الأباجور واللون أولاً.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        triggerButton
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 {isEditing ? triggerButton : dialogTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                 <Form {...form}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'تعديل الفتحة' : `إضافة الفتحة رقم ${openingsCount + 1}`}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? 'قم بتعديل تفاصيل الفتحة أدناه.' : 'أضف الفتحات واحدة تلو الأخرى. ستظهر في جدول بالأسفل.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                            {/* Step 1: Input Method */}
                            <FormField
                                control={form.control}
                                name="method"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>الخطوة 1: اختر طريقة الإدخال</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-2 gap-2"
                                            >
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroupItem value="direct" id="direct" className="sr-only" />
                                                    </FormControl>
                                                    <FormLabel htmlFor="direct" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground ${field.value === 'direct' ? 'border-primary' : ''}`}>
                                                        مباشرة
                                                        <span className="text-xs text-muted-foreground mt-1 hidden sm:inline">طول وعدد</span>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroupItem value="measure" id="measure" className="sr-only"/>
                                                    </FormControl>
                                                    <FormLabel htmlFor="measure" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground ${field.value === 'measure' ? 'border-primary' : ''}`}>
                                                        قياس
                                                        <span className="text-xs text-muted-foreground mt-1 hidden sm:inline">عرض × ارتفاع</span>
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
                                <FormLabel>الخطوة 2: أدخل الأبعاد (بالسنتيمتر)</FormLabel>
                                <div className="p-4 border rounded-lg mt-2 grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="width"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>عرض الفتحة</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} disabled={watchMethod !== 'measure'} placeholder="للقياس فقط" />
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
                                                <FormLabel>ارتفاع الفتحة</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} disabled={watchMethod !== 'measure'} placeholder="للقياس فقط" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="codeLength"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>طول الشفرة</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} disabled={watchMethod === 'measure'} placeholder={watchMethod === 'measure' ? 'محسوب' : ''}/>
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
                                                    <Input type="number" {...field} value={field.value ?? ''} disabled={watchMethod === 'measure'} placeholder={watchMethod === 'measure' ? 'محسوب' : ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                            <div className="flex justify-between font-bold"><span>طول المجرى الإجمالي (قطعتين):</span> <span className="font-mono">{channelLength.toFixed(2)} سم</span></div>
                                        </div>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ملاحظات (اختياري)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="أضف أي ملاحظات خاصة لهذه الفتحة..." {...field} value={field.value ?? ''} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:justify-start pt-4 border-t flex-col-reverse sm:flex-row">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                                إلغاء
                            </Button>
                            {!isEditing && (
                                <Button type="button" variant="secondary" onClick={handleSaveAndContinue}>
                                    إضافة والمتابعة
                                </Button>
                            )}
                             <Button type="button" onClick={handleSaveAndClose}>
                                {isEditing ? 'حفظ التعديلات' : 'إضافة وإغلاق'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

    