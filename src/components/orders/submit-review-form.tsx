
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitOrderReview } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const reviewSchema = z.object({
  rating: z.number().min(1, 'التقييم مطلوب.').max(5),
  review: z.string().min(10, 'الرجاء كتابة مراجعة لا تقل عن 10 أحرف.').max(500),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function SubmitReviewForm({ orderId }: { orderId: string }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      review: '',
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    startTransition(async () => {
      const result = await submitOrderReview(orderId, data);
      if (result.success) {
        toast({
          title: 'شكرًا لتقييمك!',
          description: 'تم إرسال مراجعتك بنجاح.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'حدث خطأ',
          description: result.error,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تقييمك العام</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-8 w-8 cursor-pointer transition-colors',
                        (hoverRating || field.value) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => field.onChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظاتك</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="شاركنا رأيك حول جودة المنتج، خدمة التركيب، أو أي شيء آخر..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إرسال التقييم
        </Button>
      </form>
    </Form>
  );
}
