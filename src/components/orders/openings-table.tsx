
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
import { Trash2 } from "lucide-react";
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

interface OpeningsTableProps {
    openings: Opening[];
    bladeWidth: number;
    onUpdateOpening: (index: number, opening: Omit<Opening, 'serial'>) => void;
    onDeleteOpening: (index: number) => void;
}

function DeleteOpeningAlert({ onDelete }: { onDelete: () => void }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="destructive" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">حذف</span>
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
    
    return (
        <div className="w-full">
            <div className="overflow-x-auto border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>طول الشفرة (سم)</TableHead>
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
                                       <AddOpeningForm
                                            isEditing={true}
                                            openingToEdit={opening}
                                            onSave={(updatedOpening) => onUpdateOpening(index, updatedOpening)}
                                            bladeWidth={bladeWidth}
                                            isDisabled={false}
                                            openingsCount={0} // Not relevant for editing
                                        />
                                        <DeleteOpeningAlert onDelete={() => onDeleteOpening(index)} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
