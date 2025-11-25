
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
import { Trash2, ChevronDown } from "lucide-react";
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
import React from "react";

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
                        <TableHead className="w-[50px] hidden md:table-cell">#</TableHead>
                        <TableHead>طول الشفرة (سم)</TableHead>
                        <TableHead>عدد الشفرات</TableHead>
                        <TableHead className="hidden md:table-cell">إضافات</TableHead>
                        <TableHead className="hidden lg:table-cell">ملاحظات</TableHead>
                        <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {openings.map((opening, index) => {
                        const isCollapsibleOpen = openRow === opening.serial;
                        return (
                            <React.Fragment key={opening.serial}>
                                <TableRow className="align-top md:hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <TableCell className="font-medium hidden md:table-cell">{index + 1}</TableCell>
                                    
                                    {/* Mobile View Cells */}
                                    <TableCell className="font-medium md:hidden w-[60px] align-middle">
                                       <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold">{index + 1}</div>
                                    </TableCell>
                                    <TableCell className="font-medium md:hidden align-middle">
                                        <div>
                                            <div className="text-xs text-muted-foreground">طول الشفرة</div>
                                            <div className="font-bold">{opening.codeLength.toFixed(2)} سم</div>
                                        </div>
                                         <div className="mt-1">
                                            <div className="text-xs text-muted-foreground">عدد الشفرات</div>
                                            <div className="font-bold">{opening.numberOfCodes}</div>
                                        </div>
                                    </TableCell>
                                    
                                    {/* Desktop View Cells */}
                                    <TableCell className="font-medium hidden md:table-cell">{opening.codeLength.toFixed(2)}</TableCell>
                                    <TableCell className="font-medium hidden md:table-cell">{opening.numberOfCodes}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex flex-col gap-1 items-start">
                                            {opening.hasEndCap && <Badge variant="secondary">نهاية</Badge>}
                                            {opening.hasAccessories && <Badge variant="secondary">مجاري</Badge>}
                                            {!opening.hasEndCap && !opening.hasAccessories && <span className="text-xs text-muted-foreground">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{opening.notes || '-'}</TableCell>
                                    
                                    <TableCell className="text-left align-middle">
                                        <div className="flex gap-1 justify-end">
                                            <AddOpeningForm
                                                isEditing={true}
                                                openingToEdit={opening}
                                                onSave={(updatedOpening) => onUpdateOpening(index, updatedOpening)}
                                                bladeWidth={bladeWidth}
                                                isDisabled={false}
                                                openingsCount={0}
                                            />
                                            <DeleteOpeningAlert onDelete={() => onDeleteOpening(index)} />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 data-[state=open]:bg-accent md:hidden"
                                                data-state={isCollapsibleOpen ? 'open' : 'closed'}
                                                onClick={() => setOpenRow(isCollapsibleOpen ? null : opening.serial)}
                                            >
                                                <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                                                <span className="sr-only">عرض التفاصيل</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                {isCollapsibleOpen && (
                                     <tr className="bg-muted/50 md:hidden">
                                        <TableCell colSpan={3} className="p-0">
                                            <div className="p-4 space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-2">الإضافات</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {opening.hasEndCap && <Badge variant="secondary">نهاية</Badge>}
                                                        {opening.hasAccessories && <Badge variant="secondary">مجاري</Badge>}
                                                        {!opening.hasEndCap && !opening.hasAccessories && <p className="text-xs text-muted-foreground">لا توجد إضافات</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-2">الملاحظات</h4>
                                                    <p className="text-sm text-muted-foreground">{opening.notes || 'لا توجد ملاحظات.'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
