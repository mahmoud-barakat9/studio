
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, Pencil } from "lucide-react";
import type { Opening } from "@/lib/definitions";
import { Badge } from "../ui/badge";
import { AddOpeningForm } from "./add-opening-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OpeningsTableProps {
    openings: Opening[];
    bladeWidth: number;
    onUpdateOpening: (index: number, opening: Omit<Opening, 'serial'>) => void;
    onDeleteOpening: (index: number) => void;
}

function DeleteOpeningAlert({ onDelete, size = "icon" }: { onDelete: () => void, size?: "default" | "icon" }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
           <Button 
                size={size} 
                variant="destructive" 
                className={cn(size === 'icon' && "h-8 w-8")}
            >
                <Trash2 className="h-4 w-4" />
                {size === 'default' && <span className="mr-2">حذف</span>}
                <span className="sr-only">حذف الفتحة</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف هذه الفتحة من الطلب.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>متابعة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
}

export function OpeningsTable({ openings, bladeWidth, onUpdateOpening, onDeleteOpening }: OpeningsTableProps) {
    const [openRow, setOpenRow] = useState<string | null>(null);
    
    return (
        <div className="w-full border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="md:table-cell w-[50px]">#</TableHead>
                        <TableHead>الأبعاد</TableHead>
                        <TableHead className="hidden md:table-cell">إضافات</TableHead>
                        <TableHead className="hidden lg:table-cell">ملاحظات</TableHead>
                        <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {openings.map((opening, index) => (
                        <Collapsible asChild key={opening.serial} open={openRow === opening.serial} onOpenChange={() => setOpenRow(openRow === opening.serial ? null : opening.serial)}>
                            <>
                                <TableRow className="align-middle">
                                    <TableCell className="font-medium md:table-cell">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{opening.codeLength.toFixed(2)} سم <span className="text-muted-foreground">x</span> {opening.numberOfCodes} شفرات</div>
                                        <div className="text-xs text-muted-foreground md:hidden mt-1">
                                            {opening.notes || 'لا توجد ملاحظات'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                         <div className="flex flex-col gap-1">
                                            {opening.hasEndCap && <Badge variant="secondary">نهاية</Badge>}
                                            {opening.hasAccessories && <Badge variant="secondary">مجاري</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{opening.notes || '-'}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex gap-2">
                                            <div className="hidden md:flex">
                                                <AddOpeningForm
                                                        isEditing={true}
                                                        openingToEdit={opening}
                                                        onSave={(updatedOpening) => onUpdateOpening(index, updatedOpening)}
                                                        bladeWidth={bladeWidth}
                                                        isDisabled={false}
                                                        openingsCount={0}
                                                    />
                                            </div>
                                            <CollapsibleTrigger asChild className="md:hidden">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                                                </Button>
                                            </CollapsibleTrigger>
                                             <div className="hidden md:flex">
                                                <DeleteOpeningAlert onDelete={() => onDeleteOpening(index)} />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <CollapsibleContent asChild>
                                   <tr className="bg-muted/50 md:hidden">
                                        <TableCell colSpan={5} className="p-0">
                                            <div className="p-4 space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-1">الإضافات</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {opening.hasEndCap && <Badge variant="secondary">نهاية</Badge>}
                                                        {opening.hasAccessories && <Badge variant="secondary">مجاري</Badge>}
                                                        {!opening.hasEndCap && !opening.hasAccessories && <span className="text-xs text-muted-foreground">لا توجد</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-1">الملاحظات</h4>
                                                    <p className="text-sm text-muted-foreground">{opening.notes || 'لا توجد ملاحظات.'}</p>
                                                </div>
                                                <div className="flex gap-2 pt-2 border-t border-border">
                                                     <AddOpeningForm
                                                        isEditing={true}
                                                        openingToEdit={opening}
                                                        onSave={(updatedOpening) => onUpdateOpening(index, updatedOpening)}
                                                        bladeWidth={bladeWidth}
                                                        isDisabled={false}
                                                        openingsCount={0}
                                                    />
                                                    <DeleteOpeningAlert onDelete={() => onDeleteOpening(index)} size="default"/>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </tr>
                                </CollapsibleContent>
                            </>
                        </Collapsible>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
