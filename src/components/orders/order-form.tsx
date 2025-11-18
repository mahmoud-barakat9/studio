"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, Wand2, Loader2 } from "lucide-react";
import {
  calculateAbjourDimensions,
  generateOrderName,
  createOrder,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import React, { useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

const openingSchema = z.object({
  serial: z.string().min(1, "Serial is required."),
  abjourType: z.string().min(1, "Type is required."),
  color: z.string().min(1, "Color is required."),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  codeLength: z.coerce.number().min(0.1, "Length is required."),
  numberOfCodes: z.coerce.number().int().min(1, "Codes are required."),
  hasEndCap: z.boolean().default(false),
  hasAccessories: z.boolean().default(false),
});

const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required."),
  customerPhone: z.string().min(1, "Phone number is required."),
  orderName: z.string().min(1, "Order name is required."),
  openings: z.array(openingSchema).min(1, "At least one opening is required."),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const abjourTypes = ["Standard", "Narrow", "Wide"];
const colors = ["White", "Beige", "Gray", "Black", "Wood Finish", "Silver"];

export function OrderForm() {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "Fatima Zahra",
      customerPhone: "555-5678",
      orderName: "",
      openings: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "openings",
  });

  const [totalArea, setTotalArea] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const { toast } = useToast();
  
  const [nameState, generateNameAction] = useFormState(generateOrderName, null);
  const [dimState, calculateDimsAction] = useFormState(calculateAbjourDimensions, null);
  const [isNamePending, startNameTransition] = useTransition();
  const [isDimPending, startDimTransition] = useTransition();


  const openings = form.watch("openings");

  useEffect(() => {
    const newTotalArea = openings.reduce(
      (acc, op) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * 0.05, // Example calculation
      0
    );
    const newTotalCost = newTotalArea * 120; // Example price
    setTotalArea(newTotalArea);
    setTotalCost(newTotalCost);
  }, [openings]);

  useEffect(() => {
    if (nameState?.data?.orderName) {
      form.setValue("orderName", nameState.data.orderName);
      toast({ title: "Suggested Name Generated!", description: "The order name has been filled in for you." });
    }
    if (nameState?.error) {
       toast({ variant: "destructive", title: "Error", description: nameState.error });
    }
  }, [nameState, form, toast]);


  const handleSuggestName = () => {
    const firstOpening = form.getValues("openings.0");
    if (!firstOpening) {
      toast({ variant: "destructive", title: "Error", description: "Please add at least one opening to generate a name." });
      return;
    }
    startNameTransition(() => {
      generateNameAction(firstOpening);
    });
  };

  const handleCalculateDims = (index: number) => {
    const opening = form.getValues(`openings.${index}`);
    if (!opening.width || !opening.abjourType) {
       toast({ variant: "destructive", title: "Error", description: "Please provide both width and abjour type to calculate." });
       return;
    }
    
    startDimTransition(async () => {
        const result = await calculateAbjourDimensions(null, { width: opening.width!, abjourType: opening.abjourType });
        if(result.data) {
            form.setValue(`openings.${index}.codeLength`, result.data.codeLength);
            form.setValue(`openings.${index}.numberOfCodes`, result.data.numberOfCodes);
            toast({ title: "Dimensions Calculated!", description: "Code length and number of codes have been updated." });
        }
        if(result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    });
  }

  return (
    <Form {...form}>
      <form action={() => form.handleSubmit(d => createOrder(d))()} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Order Openings</CardTitle>
                    <Button type="button" size="sm" variant="outline" onClick={() => append({ serial: `A${fields.length + 1}`, abjourType: 'Standard', color: 'White', codeLength: 0, numberOfCodes: 0, hasEndCap: false, hasAccessories: false })}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Opening
                    </Button>
                </div>
                <CardDescription>Add one or more openings for this order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                        <Trash2 className="w-4 h-4" />
                     </Button>
                     <div className="grid md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`openings.${index}.serial`} render={({ field }) => (<FormItem><FormLabel>Serial</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`openings.${index}.abjourType`} render={({ field }) => (<FormItem><FormLabel>Abjour Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{abjourTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`openings.${index}.color`} render={({ field }) => (<FormItem><FormLabel>Color</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                     </div>
                     <Separator />
                     <div className="grid md:grid-cols-2 gap-4 items-end">
                        <div>
                            <p className="text-sm font-medium mb-2">Enter Dimensions Manually or...</p>
                             <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name={`openings.${index}.codeLength`} render={({ field }) => (<FormItem><FormLabel>Code Length</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`openings.${index}.numberOfCodes`} render={({ field }) => (<FormItem><FormLabel>Number of Codes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm font-medium">...Calculate Automatically with AI</p>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <FormField control={form.control} name={`openings.${index}.width`} render={({ field }) => (<FormItem><FormLabel>Opening Width (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <Button type="button" onClick={() => handleCalculateDims(index)} disabled={isDimPending}>
                                    {isDimPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Calculate
                                </Button>
                            </div>
                        </div>
                     </div>
                     <Separator />
                     <div className="flex items-center space-x-4">
                        <FormField control={form.control} name={`openings.${index}.hasEndCap`} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Add End Cap</FormLabel></FormItem>)} />
                        <FormField control={form.control} name={`openings.${index}.hasAccessories`} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Add Accessories</FormLabel></FormItem>)} />
                     </div>
                  </div>
                ))}
                 {form.formState.errors.openings && !form.formState.errors.openings.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.openings.message}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <FormField
                    control={form.control}
                    name="orderName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Order Name</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-2">
                            <Input {...field} placeholder="e.g., 'Villa Living Room'" />
                            <Button type="button" size="icon" variant="outline" onClick={handleSuggestName} disabled={isNamePending}>
                               {isNamePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                <span className="sr-only">Suggest Name</span>
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
                        <span className="text-muted-foreground">Total Area</span>
                        <span className="font-medium">{totalArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Cost</span>
                        <span className="font-medium">${totalCost.toFixed(2)}</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
