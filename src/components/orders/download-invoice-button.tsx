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
            // Apply capture-specific styles temporarily
            const originalStyle = invoiceElement.style.cssText;
            invoiceElement.style.margin = '0';
            invoiceElement.style.padding = '48px'; // Ensure 12 (3rem) padding is kept in capture
            
            toPng(invoiceElement, { 
                cacheBust: true, 
                backgroundColor: 'white',
                pixelRatio: 2,
                width: 800,
                height: invoiceElement.scrollHeight,
                style: {
                    transform: 'none',
                    left: '0',
                    top: '0',
                    margin: '0',
                }
            })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `فاتورة-${type}-${orderId}.png`;
                link.href = dataUrl;
                link.click();
                
                // Restore original style
                invoiceElement.style.cssText = originalStyle;
                setIsDownloading(false);
            })
            .catch((err) => {
                console.error('oops, something went wrong!', err);
                invoiceElement.style.cssText = originalStyle;
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