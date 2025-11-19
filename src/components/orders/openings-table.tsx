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
import { Pencil, Trash2 } from "lucide-react";
import type { Opening } from "@/lib/definitions";
import { Badge } from "../ui/badge";

interface OpeningsTableProps {
    openings: Opening[];
    onUpdateOpening: (index: number, opening: Opening) => void;
    onDeleteOpening: (index: number) => void;
}

export function OpeningsTable({ openings, onUpdateOpening, onDeleteOpening }: OpeningsTableProps) {
    // For now, edit functionality is not implemented via modal, but the hook is here.
    const handleEdit = (index: number) => {
        // In a real scenario, you would open a dialog/modal with the opening data
        // and then call onUpdateOpening with the new data.
        console.log("Editing opening:", openings[index]);
        alert("ميزة التعديل لم يتم تنفيذها بعد.");
    };
    
    const totalOpenings = openings.length;
    const totalCodeLength = openings.reduce((sum, op) => sum + op.codeLength, 0);
    const totalNumberOfCodes = openings.reduce((sum, op) => sum + op.numberOfCodes, 0);

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>طول الشفرة (م)</TableHead>
                            <TableHead>عدد الشفرات</TableHead>
                            <TableHead>إضافات</TableHead>
                            <TableHead>ملاحظات</TableHead>
                            <TableHead className="text-left">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {openings.map((opening, index) => (
                            <TableRow key={opening.serial}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{opening.codeLength.toFixed(2)}</TableCell>
                                <TableCell>{opening.numberOfCodes}</TableCell>
                                <TableCell>
                                     <div className="flex flex-col gap-1">
                                        {opening.hasEndCap && <Badge variant="secondary">نهاية</Badge>}
                                        {opening.hasAccessories && <Badge variant="secondary">مجاري</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">{opening.notes || '-'}</TableCell>
                                <TableCell className="text-left">
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleEdit(index)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">تعديل</span>
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => onDeleteOpening(index)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">حذف</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm font-medium">
                <div className="flex justify-between">
                    <span>إجمالي الفتحات:</span>
                    <span>{totalOpenings}</span>
                </div>
                 <div className="flex justify-between">
                    <span>إجمالي طول الشفرات:</span>
                    <span>{totalCodeLength.toFixed(2)} م</span>
                </div>
                 <div className="flex justify-between">
                    <span>إجمالي عدد الشفرات:</span>
                    <span>{totalNumberOfCodes}</span>
                </div>
            </div>
        </div>
    );
}
