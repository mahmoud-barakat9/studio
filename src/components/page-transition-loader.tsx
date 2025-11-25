
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress on every new navigation
    setLoading(true);
    setProgress(0); // Start progress from 0
  }, [pathname, searchParams]);

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          // Simulate loading progress
          const diff = 100 - prev;
          const increment = diff / 15; // Slow down as it gets closer to 100
          return prev + increment;
        });
      }, 100);

      const finishLoading = () => {
         clearInterval(timer);
         setProgress(100);
         setTimeout(() => {
            setLoading(false);
         }, 300); // Wait for the animation to finish
      };

      // Finish loading when the window is loaded
      if(document.readyState === 'complete') {
        finishLoading();
      } else {
        window.addEventListener('load', finishLoading);
        return () => window.removeEventListener('load', finishLoading);
      }

      return () => {
        clearInterval(timer);
        window.removeEventListener('load', finishLoading);
      };
    }
  }, [loading, pathname, searchParams]);
  
  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 w-full">
      <Progress value={progress} className="h-1 rounded-none bg-transparent" />
    </div>
  );
}
