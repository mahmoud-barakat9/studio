'use client';

import { useState } from 'react';
import { toBlob } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareInvoiceButtonProps {
    invoiceId: string;
    orderId: string;
    type: 'customer' | 'factory' | 'delivery';
}

export function ShareInvoiceButton({ invoiceId, orderId, type }: ShareInvoiceButtonProps) {
    const [isSharing, setIsSharing] = useState(false);
    const { toast } = useToast();

    const handleShare = async () => {
        const invoiceElement = document.getElementById(invoiceId);
        if (!invoiceElement) {
            toast({
                title: "خطأ",
                description: "لم يتم العثور على عنصر الفاتورة.",
                variant: "destructive"
            });
            return;
        }

        setIsSharing(true);
        try {
            const blob = await toBlob(invoiceElement, {
                cacheBust: true,
                backgroundColor: 'white',
                pixelRatio: 2,
            });

            if (!blob) throw new Error('Failed to generate image');

            const file = new File([blob], `فاتورة-${type}-${orderId}.png`, { type: 'image/png' });

            // Check if Web Share API is supported and can share files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `فاتورة الطلب ${orderId}`,
                    text: `إليك فاتورة الطلب: ${orderId}`,
                });
            } else {
                toast({
                    title: "المشاركة غير مدعومة",
                    description: "متصفحك لا يدعم مشاركة الملفات مباشرة. يرجى تنزيل الفاتورة ثم إرسالها يدويًا.",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error('Error sharing:', err);
            // Don't show error if user cancelled the share dialog
            if ((err as Error).name !== 'AbortError') {
                toast({
                    title: "خطأ في المشاركة",
                    description: "حدث خطأ أثناء محاولة مشاركة الفاتورة.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleShare} disabled={isSharing}>
            {isSharing ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Share2 className="ml-2 h-4 w-4" />
            )}
            مشاركة
        </Button>
    );
}
