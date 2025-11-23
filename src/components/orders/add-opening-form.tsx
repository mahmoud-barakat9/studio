
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
import { Textarea } from '../ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
import { VariantProps, cva } from 'class-variance-authority';

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


const addOpeningButtonVariants = cva(
    '',
    {
      variants: {
        variant: {
          default: "default",
          secondary: "secondary",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  )

interface AddOpeningFormProps extends VariantProps<typeof addOpeningButtonVariants> {
    onSave: (opening: Omit<Opening, 'serial'>) => void;
    bladeWidth: number;
    isDisabled: boolean;
    openingsCount: number;
    openingToEdit?: Opening | null;
    isEditing?: boolean;
}

export function AddOpeningForm({ 
    onSave, 
    bladeWidth, 
    isDisabled, 
    openingsCount, 
    openingToEdit, 
    isEditing = false, 
    variant
}: AddOpeningFormProps) {
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
    const watchHasAccessories = useWatch({ control: form.control, name: 'hasAccessories' });
    
    
    const finalHeight = (form.getValues('height') || 0) + 10;
    
    const channelLength = (form.getValues('height') || 0) > 0 ? ((form.getValues('height') || 0) + 5) * 2 : 0;

     useEffect(() => {
        if (watchMethod === 'measure') {
            const widthVal = form.getValues('width');
            const heightVal = form.getValues('height');

            const newCodeLength = (widthVal || 0) - 3.5;
            const newNumberOfCodes = (bladeWidth > 0 && heightVal && heightVal > 0) ? Math.ceil(((heightVal || 0) + 10) / bladeWidth) : 0;

            form.setValue('codeLength', newCodeLength > 0 ? parseFloat(newCodeLength.toFixed(2)) : undefined);
            form.setValue('numberOfCodes', newNumberOfCodes > 0 ? newNumberOfCodes : undefined);

        } else {
             if (!isEditing || !(openingToEdit?.width && openingToEdit?.height)) {
                form.setValue('codeLength', form.getValues('codeLength') || undefined);
                form.setValue('numberOfCodes', form.getValues('numberOfCodes') || undefined);
             }
        }
    }, [watchMethod, form, isEditing, openingToEdit, bladeWidth]);


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
        
        let currentCodeLength: number;
        let currentNumberOfCodes: number;
        
        if (data.method === 'measure') {
            currentCodeLength = (data.width || 0) > 0 ? (data.width || 0) - 3.5 : 0;
            currentNumberOfCodes = (bladeWidth > 0 && data.height && data.height > 0) ? Math.ceil(((data.height || 0) + 10) / bladeWidth) : 0;
        } else {
            currentCodeLength = data.codeLength || 0;
            currentNumberOfCodes = data.numberOfCodes || 0;
        }


        if (data.method === 'measure' && currentCodeLength > 0 && currentNumberOfCodes > 0) {
            finalOpeningData = {
                width: data.width,
                height: data.height,
                codeLength: currentCodeLength,
                numberOfCodes: currentNumberOfCodes,
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
        if (isEditing) return; // This action is only for adding new openings
        form.handleSubmit(data => {
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

    const triggerContent = isEditing ? (
        <>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">تعديل</span>
        </>
    ) : (
        <>
            <PlusCircle className="w-4 h-4 ml-2" />
            {openingsCount > 0 ? 'أضف فتحة أخرى' : 'أضف فتحة جديدة'}
        </>
    );

    const triggerButton = (
        <Button 
            type="button" 
            variant={isEditing ? 'outline' : addOpeningButtonVariants({ variant })} 
            size={isEditing ? 'icon' : 'default'}
            className={isEditing ? 'h-8 w-8' : ''}
            disabled={isDisabled}
        >
            {triggerContent}
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                             {isDisabled ? <span tabIndex={0}>{triggerButton}</span> : triggerButton}
                        </DialogTrigger>
                    </TooltipTrigger>
                     {isDisabled && (
                        <TooltipContent>
                            <p>الرجاء اختيار نوع الأباجور واللون أولاً.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-xl">
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
                                    <FormItem className="space-y-3">
                                        <FormLabel>الخطوة 1: اختر طريقة الإدخال</FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    type="button"
                                                    variant={field.value === 'direct' ? 'default' : 'outline'}
                                                    onClick={() => field.onChange('direct')}
                                                >
                                                    مباشرة (طول وعدد)
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={field.value === 'measure' ? 'default' : 'outline'}
                                                    onClick={() => field.onChange('measure')}
                                                >
                                                    قياس (عرض × ارتفاع)
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Step 2: Input Fields */}
                             <div>
                                <FormLabel>الخطوة 2: أدخل الأبعاد (بالسنتيمتر)</FormLabel>
                                <div className="p-4 border rounded-lg mt-2">
                                     {watchMethod === 'measure' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="width"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>عرض الفتحة</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => {
                                                                const value = e.target.valueAsNumber;
                                                                field.onChange(value);
                                                                const newCodeLength = value > 0 ? value - 3.5 : 0;
                                                                form.setValue('codeLength', newCodeLength > 0 ? parseFloat(newCodeLength.toFixed(2)) : undefined);
                                                            }}/>
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
                                                            <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => {
                                                                const value = e.target.valueAsNumber;
                                                                field.onChange(value);
                                                                const newNumberOfCodes = (bladeWidth > 0 && value > 0) ? Math.ceil((value + 10) / bladeWidth) : 0;
                                                                form.setValue('numberOfCodes', newNumberOfCodes > 0 ? newNumberOfCodes : undefined);
                                                            }}/>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <div className="col-span-2 p-3 bg-muted/50 rounded-md text-sm space-y-2">
                                                <div className="flex justify-between font-bold"><span>طول الشفرة المحسوب:</span> <span className="font-mono">{(form.watch('codeLength') || 0).toFixed(2)} سم</span></div>
                                                <div className="flex justify-between font-bold"><span>عدد الشفرات المحسوب:</span> <span className="font-mono">{form.watch('numberOfCodes') || '-'}</span></div>
                                            </div>
                                        </div>
                                     )}
                                     {watchMethod === 'direct' && (
                                        <div className="grid grid-cols-2 gap-4">
                                             <FormField
                                                control={form.control}
                                                name="codeLength"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>طول الشفرة</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} value={field.value ?? ''} />
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
                        <DialogFooter className="gap-2 pt-4 border-t sm:justify-between w-full flex-row">
                             <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                                إلغاء
                            </Button>
                            <div className="flex gap-2 justify-end">
                                {!isEditing && (
                                    <Button type="button" variant="secondary" onClick={handleSaveAndContinue}>
                                        إضافة والمتابعة
                                    </Button>
                                )}
                                <Button type="button" onClick={handleSaveAndClose}>
                                    {isEditing ? 'حفظ التعديلات' : 'إضافة وإغلاق'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
