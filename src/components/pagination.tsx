
'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            endPage = maxPagesToShow;
        } else if (currentPage >= totalPages - 2) {
            startPage = totalPages - maxPagesToShow + 1;
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
    }


    return (
        <div className="flex items-center justify-center space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rtl:rotate-180"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">الصفحة السابقة</span>
            </Button>
            
            {pageNumbers.map(number => (
                 <Button
                    key={number}
                    variant={currentPage === number ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(number)}
                    className={cn("w-9 h-9 p-0")}
                >
                    {number}
                </Button>
            ))}

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rtl:rotate-180"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">الصفحة التالية</span>
            </Button>
        </div>
    );
}
