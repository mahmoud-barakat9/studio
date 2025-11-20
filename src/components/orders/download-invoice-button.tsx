'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface DownloadInvoiceButtonProps {
    invoiceId: string;
    orderId: string;
    type: 'customer' | 'factory' | 'delivery';
}

export function DownloadInvoiceButton({ invoiceId, orderId, type }: DownloadInvoiceButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        const invoiceElement = document.getElementById(invoiceId);

        if (invoiceElement) {
            toPng(invoiceElement, { 
                cacheBust: true, 
                backgroundColor: 'white',
                pixelRatio: 2, // Increase resolution
            })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `فاتورة-${type}-${orderId}.png`;
                link.href = dataUrl;
                link.click();
                setIsDownloading(false);
            })
            .catch((err) => {
                console.error('oops, something went wrong!', err);
                setIsDownloading(false);
            });
        } else {
            console.error(`Element with id ${invoiceId} not found.`);
            setIsDownloading(false);
        }
    };

    return (
        <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="ml-2 h-4 w-4" />
            )}
            تنزيل الفاتورة
        </Button>
    );
}
